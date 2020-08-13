import { createReducer } from 'redux-act';

import { fetchCorpusAnalysis } from 'qaleph/actions/corpusAnalysisActions';
import {
  loadState,
  loadStart,
  loadError,
  objectLoadComplete
} from 'reducers/util';

const initialState = loadState();

export default createReducer({
  [fetchCorpusAnalysis.START]: state => loadStart(state),
  [fetchCorpusAnalysis.ERROR]: (state, { error }) => loadError(state, error),
  [fetchCorpusAnalysis.COMPLETE]: (state, { data }) => objectLoadComplete(data),
}, initialState);

