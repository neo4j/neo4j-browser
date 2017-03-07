import Rx from 'rxjs/Rx'
import remote from 'services/remote'
import { updateConnection } from 'shared/modules/connections/connectionsDuck'
import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'discover-bolt-host'
export const CONNECTION_ID = '$$discovery'
export const DEFAULT_BOLT_HOST = 'bolt://localhost:7687'
export const DISCOVERY_ENDPOINT = 'http://localhost:7474/'

// Actions
const SET = `${NAME}/SET`
export const DONE = `${NAME}/DONE`

// Reducer
export default function reducer (state = {}, action = {}) {
  switch (action.type) {
    case SET:
      return Object.assign({}, state, {boltHost: action.boltHost})
    default:
      return state
  }
}

// Action Creators
export const setBoltHost = (bolt) => {
  return {
    type: SET,
    boltHost: bolt
  }
}

export const updateDiscoveryConnection = (props) => {
  return updateConnection({ ...props, id: CONNECTION_ID, name: CONNECTION_ID, type: 'bolt' })
}

export const getBoltHost = (state) => {
  return state.discovery.boltHost
}

export const discoveryOnStartupEpic = (some$, store) => {
  return some$.ofType(APP_START)
    .mergeMap((action) => {
      return Rx.Observable.fromPromise(
        remote.getJSON(DISCOVERY_ENDPOINT).then((result) => { // Try to get info from server
          if (!result || !result.bolt) {
            throw new Error('No bolt address found') // No bolt info from server, throw
          }
          store.dispatch(updateDiscoveryConnection({ host: result.bolt })) // Update discovery host in redux
          return result
        }).catch((e) => {
          throw new Error('No bolt address found') // No info from server, throw
        })
      )
      .catch((e) => {
        store.dispatch(updateDiscoveryConnection({ host: DEFAULT_BOLT_HOST })) // Update discovery host in redux
        return new Promise((resolve, reject) => resolve(e))
      })
    })
    .mapTo({ type: DONE })
}
