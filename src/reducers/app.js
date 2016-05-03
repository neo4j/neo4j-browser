
function setState (state, newState) {
  return newState
}

function addFrame (state, newState) {
  return Object.assign(state, {frames: state.frames.concat(newState)})
}

function removeFrame (state, newState) {
  return Object.assign(state, {frames: state.frames.filter((frame) => frame.id !== newState.id)})
}

export default function app (state = {}, action) {
  switch (action.type) {
    case 'SET_STATE':
      return setState(state, action.state)
    case 'ADD_FRAME':
      return addFrame(state, action.state)
    case 'REMOVE_FRAME':
      return removeFrame(state, action.state)
  }
  return state
}
