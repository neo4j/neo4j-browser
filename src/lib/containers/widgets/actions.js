import * as t from './actionTypes'
import uuid from 'uuid'

export const add = (widget) => {
  return {
    type: t.ADD,
    widget: Object.assign(widget, {id: uuid.v4(), history: [], isActive: 1})
  }
}

export const didRun = (widgetId, result) => {
  return {
    type: t.DID_RUN,
    widgetId,
    result
  }
}
