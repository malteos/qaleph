import { createReducer } from 'redux-act';

import { fetchEntityTranslation } from 'qaleph/actions/entityTranslationActions';

import {
  loadState,
  loadStart,
  loadError,
  objectLoadComplete
} from 'reducers/util';

const initialState = loadState();

export default createReducer({
  [fetchEntityTranslation.START]: state => loadStart(state),
  [fetchEntityTranslation.ERROR]: (state, { error }) => loadError(state, error),
  [fetchEntityTranslation.COMPLETE]: (state, { data }) => objectLoadComplete(data),
}, initialState);
