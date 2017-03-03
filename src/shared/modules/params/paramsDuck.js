
export const NAME = 'params'
const MERGE = `${NAME}/MERGE`
const SET = `${NAME}/SET`

const initialState = {}

// Selectors
export const getParams = (state) => state[NAME]

// Reducer
export default function reducer (state = initialState, action) {
  switch (action.type) {
    case MERGE:
      return {...state, ...action.params}
    case SET:
      return action.params
    default:
      return state
  }
}

// Action creators
export const merge = (obj) => {
  return {
    type: MERGE,
    params: obj
  }
}
export const set = (obj) => {
  return {
    type: SET,
    params: obj
  }
}
