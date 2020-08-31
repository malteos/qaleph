import { createReducer } from 'redux-act';

import { fetchEntitySummary } from 'qaleph/actions/entitySummaryActions';

import {
  loadState,
  loadStart,
  loadError,
  objectLoadComplete
} from 'reducers/util';

const initialState = loadState();

export default createReducer({
  [fetchEntitySummary.START]: state => loadStart(state),
  [fetchEntitySummary.ERROR]: (state, { error }) => loadError(state, error),
  [fetchEntitySummary.COMPLETE]: (state, { data }) => objectLoadComplete(data),
}, initialState);
