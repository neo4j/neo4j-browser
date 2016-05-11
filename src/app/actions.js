import * as t from './actionTypes'

export const setState = (state) => {
  return {
    type: t.SET_STATE,
    payload: state
  }
}
