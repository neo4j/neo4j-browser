import bolt from 'services/bolt/bolt'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'

export const NAME = 'features'
export const RESET = 'features/RESET'
export const UPDATE_ONE = 'features/UPDATE_ONE'
export const UPDATE_ALL = 'features/UPDATE_ALL'

export const getAvailableProcedures = (state) => state[NAME].availableProcedures

const initialState = {availableProcedures: []}

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_ALL:
      state.availableProcedures = state.availableProcedures.concat(action.features)
      return Object.assign({}, state)
    case RESET:
      return initialState
    default:
      return state
  }
}

// Actions
export const updateFeatures = (features, context) => {
  return {
    type: UPDATE_ALL,
    features
  }
}
export const featuresDicoveryEpic = (action$, store) => {
  return action$.ofType(CONNECTION_SUCCESS)
    .mergeMap(() => {
      return bolt.routedReadTransaction('CALL dbms.procedures YIELD name')
      .then((res) => {
        store.dispatch(updateFeatures(res.records.map((record) => record.get('name'))))
        return null
      })
      .catch((e) => {
        return null
      })
    })
    .mapTo({ type: 'NOOP' })
}
