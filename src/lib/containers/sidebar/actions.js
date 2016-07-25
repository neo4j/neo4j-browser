import * as t from './actionTypes'

function toggle (id) {
  return {
    type: t.TOGGLE,
    state: {drawer: id}
  }
}

export {
  toggle
}
