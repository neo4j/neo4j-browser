export const ADD = 'history/ADD'
export const MAX_ENTRIES = 'history/MAX_ENTRIES'

function addHistory (state, newState) {
  let newHistory = [].concat(state.history)
  newHistory.unshift(newState)
  return Object.assign({}, state, { history: newHistory.slice(0, state.maxHistory) })
}

export default function (state = {history: [], maxHistory: 20}, action) {
  switch (action.type) {
    case ADD:
      return addHistory(state, action.state)
    case MAX_ENTRIES:
      return Object.assign({}, state, { maxHistory: action.maxHistory })
    default:
      return state
  }
}

export const addHistory = (state) => {
  return {
    type: ADD,
    state: state
  }
}

export const setMaxHistory = (maxHistory) => {
  return {
    type: MAX_ENTRIES,
    maxHistory: maxHistory
  }
}
