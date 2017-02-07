import remote from 'services/remote'
import bolt from 'services/bolt/bolt'
import { updateConnection, getConnection } from 'shared/modules/connections/connectionsDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'

export const NAME = 'discover-bolt-host'

// Actions
const SET = `${NAME}/SET`
const FETCH = `${NAME}/FETCH`

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

export const callDiscovery = () => {
  return {
    type: FETCH,
    discoveryEndpoint: 'http://localhost:7474/'
  }
}

export const getBoltHost = (state) => {
  return state.discovery.boltHost
}

export const addDiscoveryEpic = (some$, store) => {
  return some$.ofType(FETCH)
    .do((action) => {
      remote.getJSON(action.discoveryEndpoint).then((result) => {
        if (result) {
          const defaultNeoConnection = {
            id: 'discovery',
            name: 'discovery',
            host: result.bolt
          }
          store.dispatch(updateConnection(defaultNeoConnection))
          bolt.connectToConnection(
            getConnection(store.getState(),
            defaultNeoConnection.id)
          ).then((res) => {
            store.dispatch(executeCommand(':play start'))
          }).catch((e) => {
            store.dispatch(executeCommand(':server connect'))
          })
        }
      }).catch((e) => {
        return store.dispatch(executeCommand(':server connect'))
      })
    })
    .mapTo({ type: 'NOOP' })
}
export const startDiscoveryEpic = (some$, store) =>
  some$.ofType('APP_START')
    .do((action) => {
      store.dispatch(callDiscovery())
    })
    .mapTo({type: 'NOOP'})
