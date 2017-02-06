import remote from 'services/remote'
import { addConnection } from 'shared/modules/connections/connectionsDuck'

export const NAME = 'discovery'

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

export const discoveryEpic = (some$, store) => {
  return some$.ofType(FETCH)
    .do((action) => {
      remote.getJSON(action.discoveryEndpoint).then((result) => {
        if (result) {
          const connection = {
            name: 'discovery',
            username: 'neo4j',
            password: 'a',
            host: result.bolt
          }
          store.dispatch(addConnection(connection))
        }
      }).catch((e) => null)
    })
    .mapTo({ type: 'NOOP' })
}
