export const NAME = 'settings'
export const UPDATE = 'settings/UPDATE'

export const getSettings = (state) => state[NAME]

const initialState = {
  cmdchar: ':',
  maxHistory: 10,
  singleFrameMode: false
}

export default function settings (state = initialState, action) {
  switch (action.type) {
    case UPDATE:
      return Object.assign({}, state, action.state)
    default:
      return state
  }
}

export const update = (settings) => {
  return {
    type: UPDATE,
    state: settings
  }
}
