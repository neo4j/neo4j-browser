import * as t from './actionTypes'

export const updateGraphStyleData = (data) => {
  return {
    type: t.UPDATE_GRAPH_STYLE_DATA,
    data: data
  }
}

export const resetGraphStyleData = () => {
  return {
    type: t.RESET_GRAPH_STYLE_DATA
  }
}
