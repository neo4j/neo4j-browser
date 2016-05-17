import * as t from './actionTypes'

export const addHistory = (state) => {
  return {
    type: t.ADD_HISTORY,
    state: state
  }
}

export const setMaxHistory = (maxHistory) => {
  return {
    type: t.SET_MAX_HISTORY,
    maxHistory: maxHistory
  }
}
