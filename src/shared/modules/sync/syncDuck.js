export const NAME = 'sync'
export const ADD_SYNC = 'sync/ADD_SYNC'

/**
 * Selectors
*/
export function getToken (state) {
  return state[NAME]
}

/**
 * Reducer helpers
*/
const sync = (state, obj) => {
  return Object.assign({}, state, obj)
}

/**
 * Reducer
*/
export default function reducer (state = null, action) {
  switch (action.type) {
    case ADD_SYNC:
      return sync(state, action.obj)
    default:
      return state
  }
}

// Action creators
export function addSync (obj) {
  return {
    type: ADD_SYNC,
    obj
  }
}
