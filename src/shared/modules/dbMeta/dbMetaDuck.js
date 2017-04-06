import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import { CONNECTION_SUCCESS, DISCONNECTION_SUCCESS, LOST_CONNECTION, UPDATE_CONNECTION_STATE, CONNECTED_STATE, connectionLossFilter } from 'shared/modules/connections/connectionsDuck'

export const NAME = 'meta'
export const UPDATE = 'meta/UPDATE'
export const CLEAR = 'meta/CLEAR'

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
    case CLEAR:
      return {...initialState}
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

// Epics
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

export const dbMetaEpic = (some$, store) =>
  some$.ofType(UPDATE_CONNECTION_STATE).filter((s) => s.state === CONNECTED_STATE)
    .merge(some$.ofType(CONNECTION_SUCCESS))
    .mergeMap(() => {
      return Rx.Observable.timer(0, 20000)
      .mergeMap(() =>
        Rx.Observable
        .fromPromise(bolt.routedReadTransaction(metaQuery))
        .catch((e) => Rx.Observable.of(null))
      )
      .filter((r) => r)
      .map((res) => updateMeta(res))
      .takeUntil(some$.ofType(LOST_CONNECTION).filter(connectionLossFilter))
    })

export const clearMetaOnDisconnectEpic = (some$, store) =>
  some$.ofType(DISCONNECTION_SUCCESS)
    .mapTo({ type: CLEAR })
