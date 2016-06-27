import * as t from './actionTypes'

export const setActive = (id, context) => {
  return {
    type: t.SET_ACTIVE,
    id,
    context
  }
}
