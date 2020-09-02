import spacy
import logging
from normality import collapse_spaces
from fingerprints import clean_entity_name
from followthemoney.types import registry

from ingestors import settings
from ingestors.analysis.country import location_country
from ingestors.analysis.util import TAG_PERSON, TAG_COMPANY
from ingestors.analysis.util import TAG_LOCATION, TAG_COUNTRY

log = logging.getLogger(__name__)
NAME_MAX_LENGTH = 100
NAME_MIN_LENGTH = 4
# https://spacy.io/api/annotation#named-entities
SPACY_TYPES = {
    "PER": TAG_PERSON,
    "PERSON": TAG_PERSON,
    "ORG": TAG_COMPANY,
    "LOC": TAG_LOCATION,
    "GPE": TAG_LOCATION,
}


def clean_name(text):
    if text is None or len(text) > NAME_MAX_LENGTH:
        return
    text = clean_entity_name(text)
    text = collapse_spaces(text)
    if text is None or len(text) <= NAME_MIN_LENGTH or " " not in text:
        return
    return text


def _load_model(lang):
    """Load the spaCy model for the specified language"""
    attr_name = "_nlp_%s" % lang
    if not hasattr(settings, attr_name):
        log.info("Loading spaCy model: %s..." % lang)
        try:
            model = spacy.load(lang, disable=["tagger", "parser"])
            setattr(settings, attr_name, model)
        except OSError:
            log.error("Cannot load spaCy model: %s", lang)
    return getattr(settings, attr_name)


def get_models(entity):
    """Iterate over the NER models applicable to the given entity."""
    languages = entity.get_type_values(registry.language)
    models = []
    for lang in languages:
        if lang in settings.NER_MODELS:
            models.append(_load_model(lang))
    if not len(models):
        models.append(_load_model(settings.NER_DEFAULT_MODEL))
    return models


def extract_entities(entity, text):
    for model in get_models(entity):
        # log.debug("NER tagging %d chars (%s)", len(text), model.lang)
        doc = model(text)
        for ent in doc.ents:
            prop = SPACY_TYPES.get(ent.label_)
            if prop is None:
                continue
            if prop in (TAG_COMPANY, TAG_PERSON):
                name = clean_name(ent.text)
                yield (prop, name)
            if prop == TAG_LOCATION:
                for country in location_country(ent.text):
                    yield (TAG_COUNTRY, country)
