
function addFrame (state, newState) {
  return state.concat(newState)
}

function removeFrame (state, newState) {
  return state.filter((frame) => frame.id !== newState.id)
}

export default function frames (state = [], action) {
  switch (action.type) {
    case 'ADD_FRAME':
      return addFrame(state, action.state)
    case 'REMOVE_FRAME':
      return removeFrame(state, action.state)
  }
  return state
}
