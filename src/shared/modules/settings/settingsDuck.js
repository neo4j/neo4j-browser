import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'settings'
export const UPDATE = 'settings/UPDATE'

export const getSettings = (state) => state[NAME]
export const getInitCmd = (state) => state[NAME].initCmd || initialState.initCmd
export const getTheme = (state) => state[NAME].theme || initialState.theme
export const getUseBoltRouting = (state) => state[NAME].useBoltRouting || initialState.useBoltRouting
export const getBrowserSyncConfig = (state) => {
  return getSettings(state).browserSyncDebugServer
    ? {...browserSyncConfig, authWindowUrl: getSettings(state).browserSyncDebugServer}
    : browserSyncConfig
}

const browserSyncConfig = {
  authWindowUrl: 'https://auth.neo4j.com/indexNewBrowser.html',
  firebaseConfig: {
    apiKey: 'AIzaSyA1RwZMBWHxqRGyY3CK60leRkr56H6GHV4',
    databaseURL: 'https://fiery-heat-7952.firebaseio.com',
    messagingSenderId: '352959348981'
  }
}
export const getUseNewVisualization = (state) => state[NAME].useNewVis

const initialState = {
  cmdchar: ':',
  maxHistory: 30,
  theme: 'normal',
  useBoltRouting: false,
  initCmd: ':play start',
  initialNodeDisplay: 300,
  maxNeighbours: 100,
  showSampleScripts: true,
  browserSyncDebugServer: null
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

export const updateBoltRouting = (useRouting) => {
  return {
    type: UPDATE,
    state: {
      useBoltRouting: useRouting
    }
  }
}

export const update = (settings) => {
  return {
    type: UPDATE,
    state: settings
  }
}
