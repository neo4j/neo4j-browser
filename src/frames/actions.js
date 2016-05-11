import uuid from 'uuid'
import * as t from './actionTypes'

function add (payload) {
  return {
    type: t.ADD,
    state: Object.assign(payload, {id: (payload.id || uuid.v1())})
  }
}

export {
  add
}
