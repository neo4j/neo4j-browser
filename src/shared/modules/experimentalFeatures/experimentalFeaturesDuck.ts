import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'experimentalFeatures'
const FEATURE_ON = `${NAME}/FEATURE_ON`
const FEATURE_OFF = `${NAME}/FEATURE_OFF`

export const getExperimentalFeatures = (state: any) => state[NAME]
export const showFeature = (state: any, name: any) =>
  !!(state[NAME][name] || {}).on

export const experimentalFeatureSelfName = 'showSelf'

export const initialState = {
  [experimentalFeatureSelfName]: {
    name: experimentalFeatureSelfName,
    on: true,
    displayName: 'Show experimental features',
    tooltip: 'Show feature section in settings drawer'
  }
}

// Helpers
const cherrypickAndMergeStates = (base: any, stored: any) => {
  if (!stored) {
    return { ...base }
  }
  const existingFeatures = Object.keys(base)
  return existingFeatures.reduce((all: any, name) => {
    if (!stored.hasOwnProperty(name) || stored[name].on === undefined) {
      all[name] = base[name]
      return all
    }
    all[name] = { ...base[name], on: stored[name].on }
    return all
  }, {})
}

// Reducer
export default function experimentalFeatures(
  state: any = initialState,
  action: any
) {
  switch (action.type) {
    case APP_START:
      return cherrypickAndMergeStates(initialState, state)
    case FEATURE_ON:
      if (!state.hasOwnProperty(action.name)) {
        return state
      }
      return { ...state, [action.name]: { ...state[action.name], on: true } }
    case FEATURE_OFF:
      if (!state.hasOwnProperty(action.name)) {
        return state
      }
      return { ...state, [action.name]: { ...state[action.name], on: false } }
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

export const enableExperimentalFeature = (name: any) => {
  return {
    type: FEATURE_ON,
    name
  }
}

export const disableExperimentalFeature = (name: any) => {
  return {
    type: FEATURE_OFF,
    name
  }
}
