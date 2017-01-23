import uuid from 'uuid'

const NAME = 'datasource'

export const ADD = 'datasource/ADD'
export const REMOVE = 'datasource/REMOVE'
export const DID_RUN = 'datasource/DID_RUN'
export const DID_FAIL = 'datasource/DID_FAIL'
export const UPDATE = 'datasource/UPDATE'
export const COMMAND_QUEUED = 'datasource/COMMAND_QUEUED'

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

export function getDataSourceById (state, id) {
  return getDataSources(state).filter((w) => w.id === id)[0] || false
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
    case ADD:
      return add(state, action.dataSource)
    case REMOVE:
      return remove(state, action.uuid)
    case DID_RUN:
      return didRun(state, action.dataSourceId, action.result)
    default:
      return state
  }
}


// Actions
export const add = (dataSource) => {
  return {
    type: ADD,
    dataSource: Object.assign({}, dataSource, {id: (dataSource.id || uuid.v4()), isActive: 1})
  }
}

export const remove = (dsuuid) => {
  return {
    type: REMOVE,
    uuid: dsuuid
  }
}

export const executeCommand = (cmd, dataSourceId, bookmarkId, resultId) => {
  return {
    type: COMMAND_QUEUED,
    cmd,
    dataSourceId,
    bookmarkId,
    resultId
  }
}

export const didRun = (dataSourceId, result) => {
  return {
    type: DID_RUN,
    dataSourceId,
    result
  }
}
