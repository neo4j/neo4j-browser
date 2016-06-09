import * as t from './actionTypes'

function addHistory (state, newState) {
  let newHistory = [].concat(state.history)
  newHistory.unshift(newState)
  return Object.assign({}, state, { history: newHistory.slice(0, state.maxHistory) })
}

export default function (state = {history: [], maxHistory: 20, content: ''}, action) {
  switch (action.type) {
    case t.ADD_HISTORY:
      return addHistory(state, action.state)
    case t.SET_MAX_HISTORY:
      return Object.assign({}, state, { maxHistory: action.maxHistory })
    case t.SET_CONTENT:
      return Object.assign({}, state, { content: action.cmd })
    default:
      return state
  }
}
