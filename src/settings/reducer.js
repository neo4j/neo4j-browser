import * as t from './actionTypes'

const initialState = {
  cmdchar: ':',
  maxHistory: 10,
  singleFrameMode: false
}

export default function settings (state = initialState, action) {
  switch (action.type) {
    case t.UPDATE:
      return Object.assign({}, state, action.state)
    default:
      return state
  }
}
