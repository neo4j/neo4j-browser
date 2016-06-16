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

function clear (context) {
  return {
    type: t.CLEAR_ALL,
    context
  }
}

function toggleVisibleFilter (type) {
  return {
    type: t.FRAME_TYPE_FILTER_UPDATED,
    frameType: type
  }
}

export {
  add,
  remove,
  clear,
  toggleVisibleFilter
}
