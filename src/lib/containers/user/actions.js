import * as t from './actionTypes'

function updateCurrentUser (username, roles) {
  return {
    type: t.UPDATE_CURRENT_USER,
    info: {
      username,
      roles
    }
  }
}

export {
  updateCurrentUser
}
