export const NAME = 'visualization'
export const UPDATE_LABELS = 'visualization/UPDATE_LABELS'
export const UPDATE_GRAPH_STYLE_DATA = 'visualization/UPDATE_GRAPH_STYLE_DATA'

export const getLabels = (state) => state[NAME].labels
export const getGraphStyleData = state => state[NAME].styleData

const initialState = {
  labels: [],
  styleData: null
}

function updateLabelData (state, labels) {
  return Object.assign({}, state, {labels: labels})
}

function updateStyleData (state, styleData) {
  return Object.assign({}, state, {styleData: styleData})
}

export default function visualization (state = initialState, action) {
  switch (action.type) {
    case UPDATE_LABELS:
      return updateLabelData(state, action.labels)
    case UPDATE_GRAPH_STYLE_DATA:
      return updateStyleData(state, action.styleData)
    default:
      return state
  }
}

export const updateLabels = (labels) => {
  return {
    type: UPDATE_LABELS,
    labels: labels
  }
}

export const updateGraphStyleData = (graphStyleData) => {
  return {
    type: UPDATE_GRAPH_STYLE_DATA,
    styleData: graphStyleData
  }
}
