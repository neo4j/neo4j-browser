import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'visualization'
export const UPDATE = 'visualization/UPDATE'

export const getLabels = (state) => state[NAME].labels

const initialState = {
  labels: []
}

export default function visualization (state = initialState, action) {
  switch (action.type) {
    case UPDATE:
      return action.state
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

export const update = (labels) => {
  return {
    type: UPDATE,
    state: { labels: labels }
  }
}
