import neo4jVisualization from 'neo4j-visualization-d3'
import { NAME } from './constants'
import * as t from './actionTypes'

const initialState = neo4jVisualization.neoGraphStyle().toSheet()

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
    default:
      return state
  }
}
