import { createReducer } from 'redux-act';

import { fetchEntityAnnotations } from 'qaleph/actions/entityAnnotationsActions';
import { fetchUpdatedAnnotations } from 'qaleph/actions/entityAnnotationsActions';

import {
  loadState,
  loadStart,
  loadError,
  objectLoadComplete
} from 'reducers/util';

const initialState = loadState();

export default createReducer({
  [fetchEntityAnnotations.START]: state => loadStart(state),
  [fetchEntityAnnotations.ERROR]: (state, { error }) => loadError(state, error),
  [fetchEntityAnnotations.COMPLETE]: (state, { data }) => objectLoadComplete(data),

  [fetchUpdatedAnnotations.START]: state => loadStart(state),
  [fetchUpdatedAnnotations.ERROR]: (state, { error }) => loadError(state, error),
  [fetchUpdatedAnnotations.COMPLETE]: (state, { data }) => objectLoadComplete(data),
}, initialState);
