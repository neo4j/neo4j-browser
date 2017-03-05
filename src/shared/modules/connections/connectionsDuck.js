import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import * as discovery from 'shared/modules/discovery/discoveryDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import { getInitCmd, getSettings } from 'shared/modules/settings/settingsDuck'

export const NAME = 'connections'
export const ADD = 'connections/ADD'
export const SET_ACTIVE = 'connections/SET_ACTIVE'
export const SELECT = 'connections/SELECT'
export const REMOVE = 'connections/REMOVE'
export const MERGE = 'connections/MERGE'
export const CONNECT = 'connections/CONNECT'
export const DISCONNECT = 'connections/DISCONNECT'
export const STARTUP_CONNECTION_SUCCESS = 'connections/STARTUP_CONNECTION_SUCCESS'
export const STARTUP_CONNECTION_FAILED = 'connections/STARTUP_CONNECTION_FAILED'
export const CONNECTION_SUCCESS = 'connections/CONNECTION_SUCCESS'
export const DISCONNECTION_SUCCESS = 'connections/DISCONNECTION_SUCCESS'

const initialState = {
  allConnectionIds: [],
  connectionsById: {},
  activeConnection: null
}

/**
 * Selectors
*/
export function getConnection (state, id) {
  return getConnections(state).filter((connection) => connection.id === id)[0]
}

export function getConnections (state) {
  return state[NAME].allConnectionIds.map((id) => state[NAME].connectionsById[id])
}

export function getActiveConnection (state) {
  return state[NAME].activeConnection || initialState.activeConnection
}

export function getActiveConnectionData (state) {
  return state[NAME].activeConnection ? state[NAME].connectionsById[state[NAME].activeConnection] : null
}

const addConnectionHelper = (state, obj) => {
  const connectionsById = {...state.connectionsById, [obj.id]: obj}
  let allConnectionIds = state.allConnectionIds
  if (state.allConnectionIds.indexOf(obj.id) < 0) {
    allConnectionIds = state.allConnectionIds.concat([obj.id])
  }
  return Object.assign(
    {},
    state,
    {allConnectionIds: allConnectionIds},
    {connectionsById: connectionsById}
  )
}

const removeConnectionHelper = (state, connectionId) => {
  const connectionsById = {...state.connectionsById}
  let allConnectionIds = state.allConnectionIds
  const index = allConnectionIds.indexOf(connectionId)
  if (index > 0) {
    allConnectionIds.splice(index, 1)
    delete connectionsById[connectionId]
  }
  return Object.assign(
    {},
    state,
    {allConnectionIds: allConnectionIds},
    {connectionsById: connectionsById}
  )
}

const mergeConnectionHelper = (state, connection) => {
  const connectionId = connection.id
  const connectionsById = {...state.connectionsById}
  let allConnectionIds = state.allConnectionIds
  const index = allConnectionIds.indexOf(connectionId)
  if (index >= 0) {
    connectionsById[connectionId] = Object.assign(
      {},
      connectionsById[connectionId],
      connection
    )
  } else {
    connectionsById[connectionId] = Object.assign({}, connection)
    allConnectionIds.push(connectionId)
  }
  return Object.assign(
    {},
    state,
    {allConnectionIds: allConnectionIds},
    {connectionsById: connectionsById}
  )
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD:
      return addConnectionHelper(state, action.connection)
    case SET_ACTIVE:
      return {...state, activeConnection: action.connectionId}
    case REMOVE:
      return removeConnectionHelper(state, action.connectionId)
    case MERGE:
      return mergeConnectionHelper(state, action.connection)
    default:
      return state
  }
}

// Actions
export const selectConnection = (id) => {
  return {
    type: SELECT,
    connectionId: id
  }
}

export const setActiveConnection = (id) => {
  return {
    type: SET_ACTIVE,
    connectionId: id
  }
}

export const addConnection = ({name, username, password, host}) => {
  return {
    type: ADD,
    connection: {id: name, name, username, password, host, type: 'bolt'}
  }
}

export const updateConnection = (connection) => {
  return {
    type: MERGE,
    connection
  }
}

export const disconnectAction = (id) => {
  return {
    type: DISCONNECT,
    id
  }
}

// Epics
export const connectEpic = (action$, store) => {
  return action$.ofType(CONNECT)
    .mergeMap((action) => {
      if (!action._responseChannel) return Rx.Observable.of(null)
      return bolt.connectToConnection(action)
        .then((res) => ({ type: action._responseChannel, success: true }))
        .catch(([e]) => ({ type: action._responseChannel, success: false, error: e }))
    })
}
export const startupConnectEpic = (action$, store) => {
  return action$.ofType(discovery.DONE)
    .mergeMap((action) => {
      const connection = getConnection(store.getState(), discovery.CONNECTION_ID)
      return new Promise((resolve, reject) => {
        bolt.connectToConnection(connection, { withotCredentials: true }) // Try without creds
          .then((r) => {
            store.dispatch(discovery.updateDiscoveryConnection({ username: undefined, password: undefined }))
            store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
            resolve({ type: STARTUP_CONNECTION_SUCCESS })
          })
          .catch(() => {
            if (!connection.username && !connection.password) { // No creds stored
              store.dispatch(setActiveConnection(null))
              store.dispatch(discovery.updateDiscoveryConnection({ username: 'neo4j', password: '' }))
              return resolve({ type: STARTUP_CONNECTION_FAILED })
            }
            bolt.connectToConnection(connection) // Try with stored creds
              .then((connection) => {
                store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
                resolve({ type: STARTUP_CONNECTION_SUCCESS })
              }).catch((e) => {
                store.dispatch(setActiveConnection(null))
                store.dispatch(discovery.updateDiscoveryConnection({ username: 'neo4j', password: '' }))
                resolve({ type: STARTUP_CONNECTION_FAILED })
              })
          })
      })
    })
}
export const startupConnectionSuccessEpic = (action$, store) => {
  return action$.ofType(STARTUP_CONNECTION_SUCCESS)
    .mapTo(executeSystemCommand(getInitCmd(store.getState()))) // execute initCmd from settings
}
export const startupConnectionFailEpic = (action$, store) => {
  return action$.ofType(STARTUP_CONNECTION_FAILED)
    .mapTo(
      executeSystemCommand(
        getSettings(store.getState()).cmdchar + 'server connect'
      )
    )
}

let lastActiveConnectionId = null
export const detectActiveConnectionChangeEpic = (action$, store) => {
  return action$.ofType(SET_ACTIVE)
    .mergeMap((action) => {
      if (lastActiveConnectionId === action.connectionId) return Rx.Observable.never() // no change
      lastActiveConnectionId = action.connectionId
      if (!action.connectionId) return Rx.Observable.of({ type: DISCONNECTION_SUCCESS }) // disconnect
      return Rx.Observable.of({ type: CONNECTION_SUCCESS }) // connect
    })
}
export const disconnectEpic = (action$, store) => {
  return action$.ofType(DISCONNECT)
    .do(() => bolt.closeActiveConnection())
    .do((action) => store.dispatch(updateConnection({ id: action.id, password: '' })))
    .mapTo(setActiveConnection(null))
}
export const disconnectSuccessEpic = (action$, store) => {
  return action$.ofType(DISCONNECTION_SUCCESS)
    .mapTo(
      executeSystemCommand(getSettings(store.getState()).cmdchar + 'server connect')
    )
}

