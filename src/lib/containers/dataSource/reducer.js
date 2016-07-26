import * as t from './actionTypes'
import { NAME } from './constants'

const initialState = {
  allIds: [],
  byId: {}
}

/**
 * Selectors
*/
export function getDataSources (state) {
  return state[NAME].allIds.map((id) => state[NAME].byId[id])
}

export function getDataSourceByName (state, name) {
  return getDataSources(state).filter((w) => w.name === name)[0] || false
}

/**
 * Reducer helpers
 */
const add = (state, obj) => {
  const byId = {...state.byId, [obj.id]: obj}
  const allIds = state.allIds.concat([obj.id])
  return {...state,
    allIds: allIds,
    byId: byId
  }
}

const remove = (state, uuid) => {
  const byId = Object.assign({}, state.byId)
  delete byId[uuid]
  const allIds = state.allIds.filter((fid) => fid !== uuid)
  return Object.assign({}, state, {allIds, byId})
}

const didRun = (state, dataSourceId, result) => {
  let dataSource = {...state.byId[dataSourceId]}
  dataSource.result = {...result}
  const byId = {...state.byId, [dataSourceId]: dataSource}
  return {...state, byId: byId}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case t.ADD:
      return add(state, action.dataSource)
    case t.REMOVE:
      return remove(state, action.uuid)
    case t.DID_RUN:
      return didRun(state, action.dataSourceId, action.result)
    default:
      return state
  }
}
