import * as t from './actionTypes'

const initialState = {
  labels: [],
  relationshipTypes: [],
  properties: []
}

/**
 * Selectors
*/
export function getMetaInContext (state, context) {
  const fLabels = state.labels.filter((l) => l.context === context)
  const fRelationshipTypes = state.relationshipTypes.filter((l) => l.context === context)
  const fProperties = state.properties.filter((l) => l.context === context)
  return {
    labels: fLabels,
    relationshipTypes: fRelationshipTypes,
    properties: fProperties
  }
}

/**
 * Helpers
*/
function updateMetaForContext (state, meta, context) {
  const fLabels = state.labels.filter((l) => l.context !== context)
  const fRelationshipTypes = state.relationshipTypes.filter((l) => l.context !== context)
  const fProperties = state.properties.filter((l) => l.context !== context)
  return {
    labels: fLabels.concat(meta.records[0].get(1).map((r) => { return {val: r, context: context} })),
    relationshipTypes: fRelationshipTypes.concat(meta.records[1].get(1).map((r) => { return {val: r, context: context} })),
    properties: fProperties.concat(meta.records[2].get(1).map((r) => { return {val: r, context: context} }))
  }
}

/**
 * Reducer
*/
export default function labels (state = initialState, action) {
  switch (action.type) {
    case t.UPDATE_META:
      return updateMetaForContext(state, action.meta, action.context)
    default:
      return state
  }
}
