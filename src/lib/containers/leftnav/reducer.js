import { NAME } from './constants'
import * as t from './actionTypes'

const initialState = []

/**
 * Selectors
*/
export function getActiveLeftNav (state, context) {
  const hasActive = state[NAME].filter((n) => n.context === context)
  if (!hasActive.length) return false
  return hasActive[0].id
}

/**
 * Helpers
*/
function setActive (state, id, context) {
  const out = state.filter((n) => n.context !== context)
  return out.concat([{id, context}])
}

export default function (state = initialState, action) {
  switch (action.type) {
    case t.SET_ACTIVE:
      return setActive(state, action.id, action.context)
    default:
      return state
  }
}
