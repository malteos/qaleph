import logging

from aleph.model import DocumentRecord
from aleph.index.indexes import entities_read_index
from aleph.index.indexes import collections_index
from aleph.index.entities import EXCLUDE_DEFAULT
from aleph.index.match import match_query
from aleph.search.parser import QueryParser, SearchQueryParser  # noqa
from aleph.search.result import QueryResult, DatabaseQueryResult  # noqa
from aleph.search.result import SearchQueryResult  # noqa
from aleph.search.query import AuthzQuery

log = logging.getLogger(__name__)


class EntitiesQuery(AuthzQuery):
    TEXT_FIELDS = ['name^3', 'text']
    PREFIX_FIELD = 'names.text'
    EXCLUDE_FIELDS = EXCLUDE_DEFAULT
    SORT_DEFAULT = []

    def get_index(self):
        # schema = self.parser.getlist('filter:schema')
        # if len(schema):
        #     return entities_read_index(schema=schema, descendants=False)
        schemata = self.parser.getlist('filter:schemata')
        if len(schemata):
            return entities_read_index(schema=schemata)
        return entities_read_index()


class MatchQuery(EntitiesQuery):
    """Given an entity, find the most similar other entities."""

    def __init__(self, parser, entity=None, collection_ids=None):
        self.entity = entity
        self.collection_ids = collection_ids
        super(MatchQuery, self).__init__(parser)

    def get_query(self):
        query = super(MatchQuery, self).get_query()
        return match_query(self.entity,
                           collection_ids=self.collection_ids,
                           query=query)


class CollectionsQuery(AuthzQuery):
    TEXT_FIELDS = ['label^3', 'text']
    SORT_DEFAULT = ['_score', {'label.kw': 'asc'}]
    PREFIX_FIELD = 'label'

    def get_index(self):
        return collections_index()


class RecordsQueryResult(SearchQueryResult):

    def __init__(self, request, parser, result):
        super(RecordsQueryResult, self).__init__(request, parser, result)
        ids = [res.get('id') for res in self.results]
        for record in DocumentRecord.find_records(ids):
            for result in self.results:
                if result['id'] == str(record.id):
                    if record.data:
                        result['data'] = record.data
                    if record.text:
                        result['text'] = record.text
