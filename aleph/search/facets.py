from pprint import pprint  # noqa

from babel import Locale
from pycountry import countries

from aleph.model.metadata import CORE_FACETS
from aleph.model.entity import Entity
from aleph.model.source import Source


def convert_bucket(facet, bucket):
    key = bucket.get('key')
    data = {
        'count': bucket.get('doc_count'),
        'id': key,
        'label': key,
    }

    if facet == 'languages':
        try:
            locale = Locale(key.strip().lower())
            data['label'] = locale.get_display_name('en_US')
        except:
            pass
    elif facet == 'countries' and key is not None:
        try:
            country = countries.get(alpha2=key.strip().upper())
            data['label'] = country.name
        except:
            pass
    return data


def convert_watchlist(entities, watchlist_id):
    output = {'entities': []}
    buckets = entities.get('buckets', [])
    entities = Entity.by_id_set([e.get('key') for e in buckets],
                                watchlist_id=watchlist_id)
    for bucket in buckets:
        entity = entities.get(bucket.get('key'))
        if entity is None:
            continue
        data = entity.to_dict()
        data['count'] = bucket.get('doc_count')
        output['entities'].append(data)
    return output


def convert_sources(facet):
    output = {'values': []}
    ids = [b.get('key') for b in facet.get('buckets', [])]
    labels = Source.all_labels(ids=ids)
    for bucket in facet.get('buckets', []):
        key = bucket.get('key')
        output['values'].append({
            'id': key,
            'label': labels.get(key, key),
            'count': bucket.get('doc_count')
        })
    return output


def convert_aggregations(result, output, args):
    """ traverse and get all facets. """
    aggs = result.get('aggregations', {})
    scoped = aggs.get('scoped', {})
    sources = scoped.get('source', {}).get('source', {})
    output['sources'] = convert_sources(sources)

    for watchlist_id in args.getlist('watchlist'):
        name = 'watchlist__%s' % watchlist_id
        # value = scoped.get(name, {}).get(name, {})
        value = aggs.get(name, {})
        value = value.get('inner', {}).get('entities', {})
        output['watchlists'][watchlist_id] = \
            convert_watchlist(value, watchlist_id)

    for facet in args.getlist('facet'):
        value = aggs.get(facet)
        data = {
            'label': CORE_FACETS.get(facet),
            'values': [convert_bucket(facet, b) for b in value.get('buckets')]
        }
        output['facets'][facet] = data
    return output
