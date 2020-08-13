
export function selectCorpusAnalysis(state) {
  console.log('selectCorpusAnalysis: ');
  // return selectObject(state, state.corpusAnalysis, 'corpusAnalysis');
  // return selectObject(state, state.corpusAnalysis, 'corpusAnalysis');
  return state.corpusAnalysis;
}

export function selectEntityAnnotations(state) {
  console.log('selectEntityAnnotations: ');
  // return selectObject(state, state.corpusAnalysis, 'corpusAnalysis');
  // return selectObject(state, state.corpusAnalysis, 'corpusAnalysis');
  return state.entityAnnotations;
}

export function selectUpdatedAnnotations(state) {
  console.log('selectUpdatedAnnotations: ');
  // return selectObject(state, state.corpusAnalysis, 'corpusAnalysis');
  // return selectObject(state, state.corpusAnalysis, 'corpusAnalysis');
  return state.updatedAnnotations;
}
