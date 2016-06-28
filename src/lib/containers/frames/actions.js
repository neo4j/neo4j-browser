import uuid from 'uuid'
import * as t from './actionTypes'

function add (payload) {
  return {
    type: t.ADD,
    state: Object.assign({}, payload, {id: (payload.id || uuid.v1())})
  }
}

function remove (id) {
  return {
    type: t.REMOVE,
    id
  }
}

function clearInContext (context) {
  return {
    type: t.CLEAR_IN_CONTEXT,
    context
  }
}

function clear () {
  return {
    type: t.CLEAR_ALL
  }
}

export {
  add,
  remove,
  clearInContext,
  clear
}
