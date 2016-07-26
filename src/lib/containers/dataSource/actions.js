import * as t from './actionTypes'
import uuid from 'uuid'

export const add = (dataSource) => {
  return {
    type: t.ADD,
    dataSource: Object.assign({}, dataSource, {id: uuid.v4(), isActive: 1})
  }
}

export const remove = (dsuuid) => {
  return {
    type: t.REMOVE,
    uuid: dsuuid
  }
}

export const didRun = (dataSourceId, result) => {
  return {
    type: t.DID_RUN,
    dataSourceId,
    result
  }
}
