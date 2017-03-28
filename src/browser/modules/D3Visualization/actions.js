import * as t from './actionTypes'

export const updateGraphStyleData = (data) => {
  return {
    type: t.UPDATE_GRAPH_STYLE_DATA,
    data: data
  }
}
