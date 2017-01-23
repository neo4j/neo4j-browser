export const NAME = 'drawer'

export const TOGGLE = 'drawer/TOGGLE'

function toggleDrawer (state, newState) {
  if (!newState.drawer) {
    return null
  }
  if (newState.drawer === state) {
    return null
  }
  return newState.drawer
}

export default function reducer (state = '', action) {
  switch (action.type) {
    case TOGGLE:
      return toggleDrawer(state, action.state)
  }
  return state
}

export function toggle (id) {
  return {
    type: TOGGLE,
    state: {drawer: id}
  }
}
