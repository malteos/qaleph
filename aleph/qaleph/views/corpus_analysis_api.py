import json
import logging

from flask import Blueprint, request

from aleph.index.indexes import entities_read_index
from aleph.search.query import Query
from aleph.search.result import QueryResult
from aleph.views.util import jsonify

log = logging.getLogger(__name__)
blueprint = Blueprint('corpus_analysis_api', __name__)

AGG_NAME = 'hits_over_time'


class CorpusAnalysisQueryResult(QueryResult):
    def __init__(self, request, parser, result):
        super(CorpusAnalysisQueryResult, self).__init__(request, parser=parser)
        self.result = result

        all_aggs = self.result.get('aggregations', {})
        agg = all_aggs.get(AGG_NAME, {})

        self.buckets = agg.get('buckets', [])

        self.total = len(self.buckets)

    def to_dict(self, serializer=None):
        self.results = self.buckets

        return super().to_dict(serializer)


class CorpusAnalysisQuery(Query):
    RESULT_CLASS = CorpusAnalysisQueryResult

    def __init__(self, parser, query=None):
        super().__init__(parser)
        self.query = query

    def get_filters(self):
        filters = super(CorpusAnalysisQuery, self).get_filters()
        if self.parser.getbool('filter:writeable'):
            ids = self.parser.authz.collections(self.parser.authz.WRITE)
            filters.append({'ids': {'values': ids}})
        return filters

    def get_index(self):
        return entities_read_index(schema=['Document'])

    def get_body(self):

        body = {
            "size": 0,
            "aggregations": {
                AGG_NAME: {
                    "date_histogram": {
                        "field": "updated_at",
                        "calendar_interval": "1d"
                    }
                }
            }
        }

        if self.query:
            log.debug('term query set: %s' % self.query)

            body.update({
                'query': {
                    'match': {
                        'text': {
                            'query': self.query,
                        }
                    }
                }
            })

        log.info("Query: %s", json.dumps(body))
        return body


@blueprint.route('/api/2/corpus_analysis', methods=['GET', 'POST'])
def index():
    """

    ---
    get:
      summary: Get term frequency over time
      description: >
        Returns a list of dates and frequencies
      parameters:
      - description: >-
          A query string in ElasticSearch query syntax. Can include field
          searches, such as `title:penguin`
        in: query
        name: q
        schema:
          type: string
      responses:
        '200':
          description: TODO
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CorpusAnalysis'
      tags:
      - Entity
    """

    queries = list(set(request.args.getlist('query')))  # all queries as unique list

    # At first: get document counts without any query set
    all_docs_res = CorpusAnalysisQuery.handle(request)

    results_by_ts = {}

    for result in all_docs_res.buckets:
        ts = result['key']

        if ts in results_by_ts:
            raise ValueError('Something went wrong: key is not unique')
        else:
            results_by_ts[ts] = {
                'timestamp': ts,
                'doc_count': result['doc_count'],
            }

            # Set doc count for other queries to zero by default
            for q in queries:
                results_by_ts[ts]['doc_count__' + q] = 0

    # Second: Aggregate doc count for each query term
    for q in queries:
        q_docs_res = CorpusAnalysisQuery.handle(request, query=q)

        for result in q_docs_res.buckets:
            ts = result['key']

            if ts in results_by_ts:
                results_by_ts[ts]['doc_count__' + q] = result['doc_count']
            else:
                raise ValueError(f'Timestamp ({ts}) does not exist for query {q}')

    # Build response
    res = {
        'status': 'ok',
        'results': [results_by_ts[ts] for ts in sorted(results_by_ts.keys())],  # ensure order
        'queries': queries,
    }

    return jsonify(res)
