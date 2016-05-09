
function setState (state, newState) {
  return newState
}

export default function app (state = {}, action) {
  switch (action.type) {
    case 'SET_STATE':
      return setState(state, action.state)
  }
  return state
}
