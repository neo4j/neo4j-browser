import neo4jVisualization from 'neo4j-visualization'
import { NAME } from './constants'
import * as t from './actionTypes'

const initialState = neo4jVisualization.neoGraphStyle().toString()

/**
 * Selectors
*/
export function getGraphStyleData (state) {
  return state[NAME]
}

/**
 * Reducer
*/
export default function visualisation (state = initialState, action) {
  switch (action.type) {
    case t.UPDATE_GRAPH_STYLE_DATA:
      return action.data
    case t.RESET_GRAPH_STYLE_DATA:
      return initialState
    default:
      return state
  }
}
