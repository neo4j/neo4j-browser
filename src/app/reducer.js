import * as t from './actionTypes'

function setState (state, newState) {
  return newState
}

export default function (state = {}, action) {
  switch (action.type) {
    case t.SET_STATE:
      return setState(state, action.state)
  }
  return state
}
