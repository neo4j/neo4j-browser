import uuid from 'uuid'
import { moveInArray } from 'services/utils'

export const NAME = 'frames'
export const ADD = 'frames/ADD'
export const REMOVE = 'frames/REMOVE'
export const CLEAR_ALL = 'frames/CLEAR_ALL'
export const CLEAR_IN_CONTEXT = 'frames/CLEAR_IN_CONTEXT'
export const FRAME_TYPE_FILTER_UPDATED = 'frames/FRAME_TYPE_FILTER_UPDATED'
export const PIN = `${NAME}/PIN`
export const UNPIN = `${NAME}/UNPIN`

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
  let allIds = [].concat(state.allIds)
  if (allIds.indexOf(newState.id) < 0) { // new frame
    const pos = findFirstFreePos(state)
    allIds.splice(pos, 0, newState.id)
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

function clearInContextHelper (state, context) {
  const toBeRemoved = getFramesInContext({[NAME]: state}, context)
  const byId = Object.assign({}, state.byId)
  toBeRemoved.forEach((f) => delete byId[f.id])
  const idsToBeRemoved = toBeRemoved.map((f) => f.id)
  const allIds = state.allIds.filter((fid) => idsToBeRemoved.indexOf(fid) < 0)
  return Object.assign({}, state, {byId, allIds})
}

function clearHelper () {
  return {...initialState}
}

function pinFrame (state, id) {
  const pos = state.allIds.indexOf(id)
  const allIds = moveInArray(pos, 0, state.allIds) // immutable operation
  const byId = Object.assign({}, state.byId)
  byId[id].isPinned = true
  return {
    ...state,
    allIds,
    byId
  }
}

function unpinFrame (state, id) {
  const currentPos = state.allIds.indexOf(id)
  const pos = findFirstFreePos(state)
  const allIds = moveInArray(currentPos, pos - 1, state.allIds) // immutable operation
  const byId = Object.assign({}, state.byId)
  byId[id].isPinned = false
  return {
    ...state,
    allIds,
    byId
  }
}

function findFirstFreePos ({ byId, allIds }) {
  let freePos = -1
  allIds.forEach((id, index) => {
    if (freePos > -1 || byId[id].isPinned) return
    freePos = index
  })
  return freePos === -1 ? allIds.length : freePos
}

/**
 * Reducer
*/
export default function reducer (state = initialState, action) {
  switch (action.type) {
    case ADD:
      return addFrame(state, action.state)
    case REMOVE:
      return removeFrame(state, action.id)
    case CLEAR_IN_CONTEXT:
      return clearInContextHelper(state, action.context)
    case CLEAR_ALL:
      return clearHelper()
    case PIN:
      return pinFrame(state, action.id)
    case UNPIN:
      return unpinFrame(state, action.id)
    default:
      return state
  }
}

// Action creators
export function add (payload) {
  return {
    type: ADD,
    state: Object.assign({}, payload, {id: (payload.id || uuid.v1())})
  }
}

export function remove (id) {
  return {
    type: REMOVE,
    id
  }
}

export function clearInContext (context) {
  return {
    type: CLEAR_IN_CONTEXT,
    context
  }
}

export function clear () {
  return {
    type: CLEAR_ALL
  }
}

export function pin (id) {
  return {
    type: PIN,
    id
  }
}

export function unpin (id) {
  return {
    type: UNPIN,
    id
  }
}
