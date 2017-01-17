export const NAME = 'sync'
export const ADD_TOKEN = 'sync/ADD_TOKEN'

/**
 * Selectors
*/
export function getToken (state) {
  return state[NAME]
}

/**
 * Reducer helpers
*/
const token = (state, obj) => {
  return Object.assign({}, state, obj)
}

/**
 * Reducer
*/
export default function reducer (state = null, action) {
  switch (action.type) {
    case ADD_TOKEN:
      return token(state, action.token)
    default:
      return state
  }
}

// Action creators
export function addToken (token) {
  console.log('addToken', token)
  return {
    type: ADD_TOKEN,
    token
  }
}
