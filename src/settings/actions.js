import * as t from './actionTypes'

export const update = (settings) => {
  return {
    type: t.UPDATE,
    state: settings
  }
}
