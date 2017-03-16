import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'settings'
export const UPDATE = 'settings/UPDATE'

export const getSettings = (state) => state[NAME]
export const getInitCmd = (state) => state[NAME].initCmd || initialState.initCmd
export const getTheme = (state) => state[NAME].theme || initialState.theme

const initialState = {
  cmdchar: ':',
  maxHistory: 30,
  theme: 'normal',
  initCmd: ':play start'
}

export default function settings (state = initialState, action) {
  switch (action.type) {
    case UPDATE:
      return Object.assign({}, state, action.state)
    case USER_CLEAR:
      return initialState
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
