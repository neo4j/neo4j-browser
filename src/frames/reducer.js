import * as t from './actionTypes'

function addFrame (state, newState) {
  return state.concat(newState)
}

function removeFrame (state, newState) {
  return state.filter((frame) => frame.id !== newState.id)
}

export default function frames (state = [], action) {
  switch (action.type) {
    case t.ADD:
      return addFrame(state, action.state)
    case t.REMOVE:
      return removeFrame(state, action.state)
  }
  return state
}
