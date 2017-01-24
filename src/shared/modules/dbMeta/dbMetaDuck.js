import { call, put } from 'redux-saga/effects'
import bolt from 'services/bolt/bolt'

export const NAME = 'meta'
export const UPDATE = 'meta/UPDATE'

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
    case UPDATE:
      return updateMetaForContext(state, action.meta, action.context)
    default:
      return state
  }
}

// Actions
export function updateMeta (meta, context) {
  return {
    type: UPDATE,
    meta,
    context
  }
}

// Sagas
const delay = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const metaQuery = `CALL db.labels() YIELD label
            WITH COLLECT(label) AS labels
            RETURN 'labels' as a, labels as result
            UNION
            CALL db.relationshipTypes() YIELD relationshipType
            WITH COLLECT(relationshipType) AS relationshipTypes
            RETURN 'relationshipTypes'as a, relationshipTypes as result
            UNION
            CALL db.propertyKeys() YIELD propertyKey
            WITH COLLECT(propertyKey) AS propertyKeys
            RETURN 'propertyKeys' as a, propertyKeys as result`

export function * startHeartbeat () {
  while (true) {
    try {
      const res = yield call(bolt.transaction, metaQuery)
      yield put(updateMeta(res))
    } catch (e) {
      console.log(e)
    }

    yield call(delay, 10000)
  }
}
