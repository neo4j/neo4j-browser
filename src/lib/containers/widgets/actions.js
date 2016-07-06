import * as t from './actionTypes'
import uuid from 'uuid'

export const add = (widget) => {
  return {
    type: t.ADD,
    widget: Object.assign({}, widget, {id: uuid.v4()})
  }
}
