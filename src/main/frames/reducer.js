import { NAME } from './constants'
import * as t from './actionTypes'

const initialState = {
  allIds: [],
  byId: {}
}

/**
 * Selectors
*/
export function getFrames (state) {
  return state[NAME].allIds.map((id) => state[NAME].byId[id])
}

export function getFramesInContext (state, context) {
  return getFrames(state).filter((f) => f.context === context)
}

/**
 * Reducer helpers
*/
function addFrame (state, newState) {
  const byId = Object.assign({}, state.byId, {[newState.id]: newState})
  let allIds = state.allIds
  if (allIds.indexOf(newState.id) < 0) {
    allIds = state.allIds.concat([newState.id])
  }
  return Object.assign(
    {},
    state,
    {allIds: allIds},
    {byId: byId}
  )
}

function removeFrame (state, id) {
  const byId = Object.assign({}, state.byId)
  delete byId[id]
  const allIds = state.allIds.filter((fid) => fid !== id)
  return Object.assign({}, state, {allIds, byId})
}

function clearInContext (state, context) {
  const toBeRemoved = getFramesInContext({[NAME]: state}, context)
  const byId = Object.assign({}, state.byId)
  toBeRemoved.forEach((f) => delete byId[f.id])
  const idsToBeRemoved = toBeRemoved.map((f) => f.id)
  const allIds = state.allIds.filter((fid) => idsToBeRemoved.indexOf(fid) < 0)
  return Object.assign({}, state, {byId, allIds})
}

function clear () {
  return {...initialState}
}

/**
 * Reducer
*/
export default function frames (state = initialState, action) {
  switch (action.type) {
    case t.ADD:
      return addFrame(state, action.state)
    case t.REMOVE:
      return removeFrame(state, action.id)
    case t.CLEAR_IN_CONTEXT:
      return clearInContext(state, action.context)
    case t.CLEAR_ALL:
      return clear()
    default:
      return state
  }
}
