import json
import logging
import re
from datetime import datetime

import spacy
from flask import Blueprint, request
from followthemoney import model
from followthemoney.proxy import EntityProxy
from followthemoney.types import registry

from aleph import settings, index
from aleph.core import db
from aleph.index.entities import iter_entities, index_entity, index_proxy
from aleph.model import Collection
from aleph.model.annotated_entity import AnnotatedEntity
from aleph.views.util import get_index_entity
from aleph.views.util import require

log = logging.getLogger(__name__)
blueprint = Blueprint('entity_annotations_api', __name__)

########
import logging
import http.client
http.client.HTTPConnection.debuglevel = 1
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True
#######


def get_tokens(spacy_doc):
    return [
        dict(
            text=token.text,
            hasWhitespace=token.whitespace_ == " ",
            linebreaksCount=token.text.count("\n"),
            start=token.idx,
            end=token.idx + len(token),
        )
        for token in spacy_doc
    ]


def get_annotated_tokens(spacy_doc):
    return [
        dict(
            start=ent.start,
            end=ent.end,
            label=ent.label_,
        )
        for ent in spacy_doc.ents
    ]


def _load_model(lang):
    """Load the spaCy model for the specified language"""
    attr_name = "_nlp_%s" % lang
    if not hasattr(settings, attr_name):
        log.info("Loading spaCy model: %s..." % lang)
        try:
            model = spacy.load(lang, disable=["tagger", "parser", "ner", "textcat"])
            setattr(settings, attr_name, model)
        except OSError:
            log.error("Cannot load spaCy model: %s", lang)
    return getattr(settings, attr_name)


@blueprint.route("/api/2/entities/<entity_id>/annotations", methods=["GET"])
def view(entity_id):
    """
    View tokens and precomputed or user-generated annotations
    ---
    get:
      summary: Get annotations for a specific entity
      description: >
        Get annotations for a specific entity with id `entity_id`
      parameters:
      - in: path
        name: entity_id
        required: true
        schema:
          type: string
      responses:
        '200':
          description: OK
      tags:
      - Entity
    """

    # Load entity
    entity = get_index_entity(entity_id, request.authz.READ)  #TODO includes
    proxy = model.get_proxy(entity, cleaned=False)
    status = None

    # Fetch existing annotations (if user is logged in)
    ae = AnnotatedEntity.by_entity_and_author(entity_id, request.authz.id) if request.authz.id else None

    if ae:
        # User-generated annotations exist
        annotations = ae.annotations  # per page
        status = ae.status_type

        log.info(f'User annotations from DB: {annotations}')
    else:
        # No annotations exist => load from entity properties (precomputed)
        if 'properties' in entity and 'annotatedEntitiesPosition' in entity['properties'] and len(
                entity['properties']['annotatedEntitiesPosition']) > 0:
            annotations = json.loads(entity['properties']['annotatedEntitiesPosition'][0])

            log.info(f'Precomputed annotations from ES: {annotations}')
        else:
            log.warning('No precomputed annotations exist')
            annotations = []

    # Get text from entity
    text = proxy.first("bodyText", quiet=True)

    if text:
        available_languages = ['eng', 'deu', 'fra', 'spa', 'por']  # see Dockerfile
        entity_languages = proxy.get_type_values(registry.language)
        nlp_model = None

        for lang in entity_languages:
            if lang in available_languages:
                # Take the first matching model
                log.info('Tokenize with: %s' % lang)
                nlp_model = _load_model(lang)
                break

        if not nlp_model:
            log.error(
                'No SpaCy model exists for tokenization of this entity language: %s (use default)' % entity_languages)
            nlp_model = _load_model('eng')

        # Tokenize
        doc = nlp_model(text)
        tokens = [
            # TODO extend to multiple pages
            # Page level
            get_tokens(doc)
        ]
    else:
        log.warning('Entity has no bodyText')
        tokens = []

    # Build pages
    pages = [
        dict(tokens=page_tokens, annotations=annotations[page_idx] if len(annotations) > page_idx else [])
        for page_idx, page_tokens in enumerate(tokens)
    ]

    # Get classes from collection summary
    collection_id = entity.get("collection_id")
    collection = Collection.by_id(collection_id)
    label_classes = ['ORG', 'PERSON', 'LOCATION', 'MISC']  # default
    if collection and collection.summary:
        match = re.search(r'^NER-tags:(.*)$', collection.summary, re.MULTILINE)

        if match:
            label_classes = [lc.strip() for lc in match.group(1).strip().split(',')]

    return dict(
        status='OK',
        data=dict(
            #TODO label classes from collection?
            labelClasses=label_classes,
            status=status,
            entityId=entity_id,
            collectionId=collection_id,
            pages=pages,
            )
        )


@blueprint.route("/api/2/entities/<entity_id>/annotations", methods=["POST"])
def update(entity_id):
    """
    ---
    get:
      summary: Get annotations for a specific entity
      description: >
        Get annotations for a specific entity with id `entity_id`
      parameters:
      - in: path
        name: entity_id
        required: true
        schema:
          type: string
      - in: query
        name: 'filter:schema'
        schema:
          items:
            type: string
          type: array
      - in: query
        name: 'filter:schemata'
        schema:
          items:
            type: string
          type: array
      responses:
        '200':
          description: OK
      tags:
      - Entity
    """
    require(request.authz.session_write)

    log.error('POST annotations %s' % request.get_json()["annotations"])
    log.error('POST annotations %s' % request.get_json()["pagesCount"])
    log.error('POST annotations %s' % request.get_json()["status"])

    post_data = request.get_json()

    # Load entity
    entity = get_index_entity(entity_id, request.authz.READ)  #TODO includes

    collection_id = entity.get("collection_id")
    collection = Collection.by_id(collection_id)
    schemata = []

    # Get entities from same collection
    other_entity_ids = [e['id'] for e in iter_entities(request.authz, collection_id, schemata, includes=['id'])]
    sorted(other_entity_ids)

    current_idx = other_entity_ids.index(entity_id)

    if len(other_entity_ids) > current_idx + 1:
        next_entity_id = other_entity_ids[current_idx + 1]
    else:
        next_entity_id = None

    # Update annotations in DB
    author_id = request.authz.id

    annotated_entity = AnnotatedEntity.by_entity_and_author(entity_id, author_id)

    if annotated_entity is None:
        annotated_entity = AnnotatedEntity()
        annotated_entity.entity_id = entity_id
        annotated_entity.collection_id = collection_id
        annotated_entity.author_id = author_id

        db.session.add(annotated_entity)

    # Set values
    status = post_data["status"] if post_data["status"] in annotated_entity.STATUS_TYPES else annotated_entity.SKIPPED

    annotated_entity.annotations = post_data["annotations"]
    annotated_entity.status_type = status
    annotated_entity.updated_at = datetime.utcnow()

    db.session.flush()
    db.session.commit()

    # Save in ES
    # Remove special keys for updating
    for k in ['_index']:
        del entity[k]

    # Set status
    entity['properties']['annotatedUserStatus'] = [status]

    log.info('Saving annotation status in ES: %s' % status)

    proxy = EntityProxy.from_dict(model, entity, cleaned=False)

    log.info('Index entity: %s' % entity)
    log.info('Index proxy: %s' % proxy)

    index_proxy(collection, proxy, sync=True)

    log.info('Index sent')

    return dict(status='ok', data=dict(entityId=entity_id, nextEntityId=next_entity_id, collectionId=collection_id))
