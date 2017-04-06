export const NAME = 'user'

export const UPDATE_CURRENT_USER = NAME + '/UPDATE_CURRENT_USER'

const initialState = {
  info: null
}

/**
 * Selectors
*/

export function getCurrentUser (state) {
  return Object.assign({}, state[NAME])
}

/**
 * Helpers
*/
function updateCurrentUserInfo (state, info) {
  return Object.assign({}, state, { info: info })
}

/**
 * Reducer
*/
export default function user (state = initialState, action) {
  switch (action.type) {
    case UPDATE_CURRENT_USER:
      const info = action.info
      if (info) {
        return updateCurrentUserInfo(state, action.info)
      } else {
        return state
      }

    default:
      return state
  }
}

// actions
export function updateCurrentUser (username, roles) {
  return {
    type: UPDATE_CURRENT_USER,
    info: {
      username,
      roles
    }
  }
}
