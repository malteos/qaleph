import { endpoint } from 'src/app/api';
import asyncActionCreator from 'actions/asyncActionCreator';

export const fetchCorpusAnalysis = asyncActionCreator((selectedQueries) => async () => {
  selectedQueries = selectedQueries || [];

  console.log('fetchCorpusAnalysis queries: ', selectedQueries);

  const params = { query: selectedQueries };
  const response = await endpoint.get('corpus_analysis', {params});

  console.log('fetchCorpusAnalysis: ', JSON.stringify(response.data));

  return { data: response.data };
}, { name: 'FETCH_CORPUS_ANALYSIS' });

