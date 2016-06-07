import { NAME } from './constants'
import * as t from './actionTypes'

const initialState = {
  allIds: [],
  byId: {},
  visibleFilter: []
}

/**
 * Selectors
*/
export function getFrames (state) {
  return state[NAME].allIds.map((id) => state[NAME].byId[id])
}

export function getVisibleFrames (state) {
  if (!state[NAME].visibleFilter.length) return getFrames(state)
  return getFrames(state).filter((frame) => {
    if (state[NAME].visibleFilter.length && state[NAME].visibleFilter.indexOf(frame.type) < 0) {
      return false
    }
    return true
  })
}

let cached = null
export function getAvailableFrameTypes (state) {
  if (cached) return cached
  cached = state[NAME].allIds.reduce((types, id) => {
    const type = state[NAME].byId[id].type
    if (types.indexOf(type) > -1) return types
    return types.concat([type])
  }, [])
  return cached
}

/**
 * Reducer helpers
*/
function addFrame (state, newState) {
  const byId = Object.assign({}, state.byId, {[newState.id]: newState})
  const allIds = state.allIds.concat([newState.id])
  return Object.assign(
    {},
    state,
    {allIds: allIds},
    {byId: byId}
  )
}

function removeFrame (state, newState) {
  const byId = Object.assign({}, state.byId)
  delete byId[newState.id]
  const allIds = state.allIds.filter((id) => id !== newState.id)
  return Object.assign({}, state, {allIds, byId})
}

function updateTypeFilter (state, newState) {
  if (state.visibleFilter.indexOf(newState.frameType) > -1) {
    return state.visibleFilter.filter((t) => t !== newState.frameType)
  }
  return state.visibleFilter.concat(newState.frameType)
}

/**
 * Reducer
*/
export default function frames (state = initialState, action) {
  switch (action.type) {
    case t.ADD:
      cached = null
      return addFrame(state, action.state)
    case t.REMOVE:
      cached = null
      return removeFrame(state, action.state)
    case t.CLEAR_ALL:
      cached = null
      return initialState
    case t.FRAME_TYPE_FILTER_UPDATED:
      return Object.assign({}, state, {visibleFilter: updateTypeFilter(state, action)})
    default:
      return state
  }
}
