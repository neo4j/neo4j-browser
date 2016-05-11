import uuid from 'uuid'
import * as t from './actionTypes'

function add ({cmd, result, id}) {
  return {
    type: t.ADD,
    state: {cmd: cmd, result: result, id: (id || uuid.v1())}
  }
}

export {
  add
}
