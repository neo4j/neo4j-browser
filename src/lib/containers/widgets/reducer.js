import * as t from './actionTypes'
import { NAME } from './constants'

const initialState = {
  allIds: [],
  byId: {}
}

/**
 * Selectors
*/
export function getWidgets (state) {
  return state[NAME].allIds.map((id) => state[NAME].byId[id])
}

export function getWidgetByName (state, name) {
  return getWidgets(state).filter((w) => w.name === name)[0] || false
}

/**
 * Reducer helpers
 */
const add = (state, obj) => {
  const byId = {...state.byId, [obj.id]: obj}
  const allIds = state.allIds.concat([obj.id])
  return Object.assign(
    {},
    state,
    {allIds: allIds},
    {byId: byId}
  )
}

const didRun = (state, widgetId, result) => {
  const widget = {...state.byId[widgetId]}
  widget.history.push(result)
  const byId = Object.assign({}, state.byId, {widgetId: widget})
  return Object.assign(
    {},
    state,
    {byId: byId}
  )
}

export default function (state = initialState, action) {
  switch (action.type) {
    case t.ADD:
      return add(state, action.widget)
    case t.DID_RUN:
      return didRun(state, action.widgetId, action.result)
    default:
      return state
  }
}
