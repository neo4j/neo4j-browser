import * as t from './actionTypes'

function toggleDrawer (state, newState) {
  if (!newState.drawer) {
    return null
  }
  if (newState.drawer === state) {
    return null
  }
  return newState.drawer
}

export default function drawer (state = '', action) {
  switch (action.type) {
    case t.TOGGLE:
      return toggleDrawer(state, action.state)
  }
  return state
}
