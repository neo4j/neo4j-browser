/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import { getEncryptionMode } from 'services/bolt/boltHelpers'
import * as discovery from 'shared/modules/discovery/discoveryDuck'
import {
  fetchMetaData,
  CLEAR as CLEAR_META
} from 'shared/modules/dbMeta/dbMetaDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import {
  getInitCmd,
  getSettings,
  getUseBoltRouting,
  getCmdChar,
  UPDATE as SETTINGS_UPDATE
} from 'shared/modules/settings/settingsDuck'
import { inWebEnv, USER_CLEAR, APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'connections'
export const ADD = 'connections/ADD'
export const SET_ACTIVE = 'connections/SET_ACTIVE'
export const SELECT = 'connections/SELECT'
export const REMOVE = 'connections/REMOVE'
export const MERGE = 'connections/MERGE'
export const CONNECT = 'connections/CONNECT'
export const DISCONNECT = 'connections/DISCONNECT'
export const SILENT_DISCONNECT = 'connections/SILENT_DISCONNECT'
export const STARTUP_CONNECTION_SUCCESS =
  'connections/STARTUP_CONNECTION_SUCCESS'
export const STARTUP_CONNECTION_FAILED = 'connections/STARTUP_CONNECTION_FAILED'
export const CONNECTION_SUCCESS = 'connections/CONNECTION_SUCCESS'
export const DISCONNECTION_SUCCESS = 'connections/DISCONNECTION_SUCCESS'
export const LOST_CONNECTION = 'connections/LOST_CONNECTION'
export const UPDATE_CONNECTION_STATE = 'connections/UPDATE_CONNECTION_STATE'
export const UPDATE_RETAIN_CREDENTIALS = NAME + '/UPDATE_RETAIN_CREDENTIALS'
export const UPDATE_AUTH_ENABLED = NAME + '/UPDATE_AUTH_ENABLED'
export const SWITCH_CONNECTION = NAME + '/SWITCH_CONNECTION'
export const SWTICH_CONNECTION_SUCCESS = NAME + '/SWTICH_CONNECTION_SUCCESS'
export const SWTICH_CONNECTION_FAILED = NAME + '/SWTICH_CONNECTION_FAILED'

export const DISCONNECTED_STATE = 0
export const CONNECTED_STATE = 1
export const PENDING_STATE = 2

const initialState = {
  allConnectionIds: [],
  connectionsById: {},
  activeConnection: null,
  connectionState: DISCONNECTED_STATE
}

/**
 * Selectors
*/
export function getConnection (state, id) {
  let connections = getConnections(state).filter(
    connection => connection && connection.id === id
  )
  if (connections && connections.length > 0) {
    return connections[0]
  } else {
    return null
  }
}

export function getConnections (state) {
  return state[NAME].allConnectionIds.map(id => state[NAME].connectionsById[id])
}

export function getConnectionState (state) {
  return state[NAME].connectionState || initialState.connectionState
}

export function isConnected (state) {
  return getConnectionState(state) === CONNECTED_STATE
}

export function getActiveConnection (state) {
  return state[NAME].activeConnection || initialState.activeConnection
}

export function getActiveConnectionData (state) {
  if (!state[NAME].activeConnection) return null
  return getConnectionData(state, state[NAME].activeConnection)
}

export function getConnectionData (state, id) {
  if (typeof state[NAME].connectionsById[id] === 'undefined') return null
  let data = state[NAME].connectionsById[id]
  if (data.username && data.password) return data
  if (!(data.username && data.password) && (memoryUsername && memoryPassword)) {
    // No retain state
    return { ...data, username: memoryUsername, password: memoryPassword }
  }
  return data
}

const addConnectionHelper = (state, obj) => {
  const connectionsById = { ...state.connectionsById, [obj.id]: obj }
  let allConnectionIds = state.allConnectionIds
  if (state.allConnectionIds.indexOf(obj.id) < 0) {
    allConnectionIds = state.allConnectionIds.concat([obj.id])
  }
  return Object.assign(
    {},
    state,
    { allConnectionIds: allConnectionIds },
    { connectionsById: connectionsById }
  )
}

const removeConnectionHelper = (state, connectionId) => {
  const connectionsById = { ...state.connectionsById }
  let allConnectionIds = state.allConnectionIds
  const index = allConnectionIds.indexOf(connectionId)
  if (index > 0) {
    allConnectionIds.splice(index, 1)
    delete connectionsById[connectionId]
  }
  return Object.assign(
    {},
    state,
    { allConnectionIds: allConnectionIds },
    { connectionsById: connectionsById }
  )
}

const mergeConnectionHelper = (state, connection) => {
  const connectionId = connection.id
  const connectionsById = { ...state.connectionsById }
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
    { allConnectionIds: allConnectionIds },
    { connectionsById: connectionsById }
  )
}

const updateAuthEnabledHelper = (state, authEnabled) => {
  const connectionId = state.activeConnection
  const updatedConnection = Object.assign(
    {},
    state.connectionsById[connectionId],
    { authEnabled: authEnabled }
  )
  const updatedConnectionByIds = Object.assign({}, state.connectionsById)
  updatedConnectionByIds[connectionId] = updatedConnection

  return Object.assign({}, state, { connectionsById: updatedConnectionByIds })
}

// Local vars
let memoryUsername = ''
let memoryPassword = ''

// Reducer
export default function (state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case ADD:
      return addConnectionHelper(state, action.connection)
    case SET_ACTIVE:
      let cState = CONNECTED_STATE
      if (!action.connectionId) cState = DISCONNECTED_STATE
      return {
        ...state,
        activeConnection: action.connectionId,
        connectionState: cState
      }
    case REMOVE:
      return removeConnectionHelper(state, action.connectionId)
    case MERGE:
      return mergeConnectionHelper(state, action.connection)
    case UPDATE_CONNECTION_STATE:
      return { ...state, connectionState: action.state }
    case UPDATE_AUTH_ENABLED:
      return updateAuthEnabledHelper(state, action.authEnabled)
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

// Actions
export const selectConnection = id => {
  return {
    type: SELECT,
    connectionId: id
  }
}

export const setActiveConnection = (id, silent = false) => {
  return {
    type: SET_ACTIVE,
    connectionId: id,
    silent: silent
  }
}

export const addConnection = ({ name, username, password, host }) => {
  return {
    type: ADD,
    connection: { id: name, name, username, password, host, type: 'bolt' }
  }
}

export const updateConnection = connection => {
  return {
    type: MERGE,
    connection
  }
}

export const disconnectAction = (id = discovery.CONNECTION_ID) => {
  return {
    type: DISCONNECT,
    id
  }
}

export const updateConnectionState = state => ({
  state,
  type: UPDATE_CONNECTION_STATE
})

const onLostConnection = dispatch => e => {
  dispatch({ type: LOST_CONNECTION, error: e })
}

export const connectionLossFilter = action => {
  const notLostCodes = [
    'Neo.ClientError.Security.Unauthorized',
    'Neo.ClientError.Security.AuthenticationRateLimit'
  ]
  return notLostCodes.indexOf(action.error.code) < 0
}

export const setRetainCredentials = shouldRetain => {
  return {
    type: UPDATE_RETAIN_CREDENTIALS,
    shouldRetain
  }
}

export const setAuthEnabled = authEnabled => {
  return {
    type: UPDATE_AUTH_ENABLED,
    authEnabled
  }
}

// Epics
export const connectEpic = (action$, store) => {
  return action$.ofType(CONNECT).mergeMap(action => {
    if (!action.$$responseChannel) return Rx.Observable.of(null)
    memoryUsername = ''
    memoryPassword = ''
    return bolt
      .openConnection(
        action,
        { encrypted: getEncryptionMode(action) },
        onLostConnection(store.dispatch)
      )
      .then(res => ({ type: action.$$responseChannel, success: true }))
      .catch(e => ({
        type: action.$$responseChannel,
        success: false,
        error: e
      }))
  })
}
export const startupConnectEpic = (action$, store) => {
  return action$.ofType(discovery.DONE).mergeMap(action => {
    const connection = getConnection(store.getState(), discovery.CONNECTION_ID)
    if (!connection || !connection.host) {
      store.dispatch(setActiveConnection(null))
      store.dispatch(
        discovery.updateDiscoveryConnection({ username: 'neo4j', password: '' })
      )
      return Promise.resolve({ type: STARTUP_CONNECTION_FAILED })
    }
    return new Promise((resolve, reject) => {
      bolt
        .openConnection(
          // Try without creds
          connection,
          {
            withoutCredentials: true,
            encrypted: getEncryptionMode(connection)
          },
          onLostConnection(store.dispatch)
        )
        .then(r => {
          store.dispatch(
            discovery.updateDiscoveryConnection({
              username: undefined,
              password: undefined
            })
          )
          store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
          resolve({ type: STARTUP_CONNECTION_SUCCESS })
        })
        .catch(() => {
          if (!connection || (!connection.username && !connection.password)) {
            // No creds stored
            store.dispatch(setActiveConnection(null))
            store.dispatch(
              discovery.updateDiscoveryConnection({
                username: 'neo4j',
                password: ''
              })
            )
            return resolve({ type: STARTUP_CONNECTION_FAILED })
          }
          bolt
            .openConnection(
              connection,
              { encrypted: getEncryptionMode(connection) },
              onLostConnection(store.dispatch)
            ) // Try with stored creds
            .then(connection => {
              store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
              resolve({ type: STARTUP_CONNECTION_SUCCESS })
            })
            .catch(e => {
              store.dispatch(setActiveConnection(null))
              store.dispatch(
                discovery.updateDiscoveryConnection({
                  username: 'neo4j',
                  password: ''
                })
              )
              resolve({ type: STARTUP_CONNECTION_FAILED })
            })
        })
    })
  })
}
export const startupConnectionSuccessEpic = (action$, store) => {
  return action$
    .ofType(STARTUP_CONNECTION_SUCCESS)
    .mapTo(executeSystemCommand(getInitCmd(store.getState()))) // execute initCmd from settings
}
export const startupConnectionFailEpic = (action$, store) => {
  return action$
    .ofType(STARTUP_CONNECTION_FAILED)
    .mapTo(
      executeSystemCommand(getCmdChar(store.getState()) + 'server connect')
    )
}

let lastActiveConnectionId = null
export const detectActiveConnectionChangeEpic = (action$, store) => {
  return action$.ofType(SET_ACTIVE).mergeMap(action => {
    if (lastActiveConnectionId === action.connectionId) {
      return Rx.Observable.never()
    } // no change
    lastActiveConnectionId = action.connectionId
    if (!action.connectionId && !action.silent) {
      // Non silent disconnect
      return Rx.Observable.of({ type: DISCONNECTION_SUCCESS })
    } else if (!action.connectionId && action.silent) {
      // Silent disconnect
      return Rx.Observable.never()
    }
    return Rx.Observable.of({ type: CONNECTION_SUCCESS }) // connect
  })
}
export const disconnectEpic = (action$, store) => {
  return action$
    .ofType(DISCONNECT)
    .merge(action$.ofType(USER_CLEAR))
    .do(() => bolt.closeConnection())
    .do(action =>
      store.dispatch(updateConnection({ id: action.id, password: '' }))
    )
    .map(action => setActiveConnection(null))
}
export const silentDisconnectEpic = (action$, store) => {
  return action$
    .ofType(SILENT_DISCONNECT)
    .do(() => bolt.closeConnection())
    .do(() => store.dispatch({ type: CLEAR_META }))
    .mapTo(setActiveConnection(null, true))
}
export const disconnectSuccessEpic = (action$, store) => {
  return action$
    .ofType(DISCONNECTION_SUCCESS)
    .mapTo(
      executeSystemCommand(
        getSettings(store.getState()).cmdchar + 'server connect'
      )
    )
}
export const connectionLostEpic = (action$, store) =>
  action$
    .ofType(LOST_CONNECTION)
    .filter(connectionLossFilter)
    .filter(() => inWebEnv(store.getState())) // Only retry in web env
    .throttleTime(5000)
    .do(() => store.dispatch(updateConnectionState(PENDING_STATE)))
    .mergeMap(action => {
      const connection = getActiveConnectionData(store.getState())
      if (!connection) return Rx.Observable.of(1)
      return Rx.Observable
        .of(1)
        .mergeMap(() => {
          return new Promise((resolve, reject) => {
            bolt
              .directConnect(
                connection,
                { encrypted: getEncryptionMode(connection) },
                e =>
                  setTimeout(
                    () => reject(new Error('Couldnt reconnect. Lost.')),
                    5000
                  )
              )
              .then(s => {
                bolt.closeConnection()
                bolt
                  .openConnection(
                    connection,
                    { encrypted: getEncryptionMode(connection) },
                    onLostConnection(store.dispatch)
                  )
                  .then(() => {
                    store.dispatch(updateConnectionState(CONNECTED_STATE))
                    resolve()
                  })
                  .catch(e => reject(new Error('Error on connect')))
              })
              .catch(e =>
                setTimeout(() => reject(new Error('Couldnt reconnect.')), 5000)
              )
          })
        })
        .retry(10)
        .catch(e => {
          bolt.closeConnection()
          store.dispatch(setActiveConnection(null))
          return Rx.Observable.of(1)
        })
        .map(() => Rx.Observable.of(1))
    })
    .mapTo({ type: 'NOOP' })

export const switchConnectionEpic = (action$, store) => {
  return action$
    .ofType(SWITCH_CONNECTION)
    .do(() => store.dispatch(updateConnectionState(PENDING_STATE)))
    .mergeMap(action => {
      bolt.closeConnection()
      const connectionInfo = { id: discovery.CONNECTION_ID, ...action }
      store.dispatch(updateConnection(connectionInfo))
      return new Promise((resolve, reject) => {
        bolt
          .openConnection(
            action,
            { encrypted: action.encrypted },
            onLostConnection(store.dispatch)
          )
          .then(connection => {
            store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
            resolve({ type: SWTICH_CONNECTION_SUCCESS })
          })
          .catch(e => {
            store.dispatch(setActiveConnection(null))
            store.dispatch(
              discovery.updateDiscoveryConnection({
                username: 'neo4j',
                password: ''
              })
            )
            resolve({ type: SWTICH_CONNECTION_FAILED })
          })
      })
    })
}

export const switchConnectionSuccessEpic = (action$, store) => {
  return action$
    .ofType(SWTICH_CONNECTION_SUCCESS)
    .do(() => store.dispatch(updateConnectionState(CONNECTED_STATE)))
    .do(() => store.dispatch(fetchMetaData()))
    .mapTo(
      executeSystemCommand(
        getCmdChar(store.getState()) + 'server switch success'
      )
    )
}
export const switchConnectionFailEpic = (action$, store) => {
  return action$
    .ofType(SWTICH_CONNECTION_FAILED)
    .do(() => store.dispatch(updateConnectionState(DISCONNECTED_STATE)))
    .mapTo(
      executeSystemCommand(getCmdChar(store.getState()) + 'server switch fail')
    )
}

export const checkSettingsForRoutingDriver = (action$, store) => {
  return action$
    .ofType(SETTINGS_UPDATE)
    .merge(action$.ofType(APP_START))
    .map(action => {
      bolt.useRoutingConfig(getUseBoltRouting(store.getState()))
      return { type: 'NOOP' }
    })
}

export const retainCredentialsSettingsEpic = (action$, store) => {
  return action$
    .ofType(UPDATE_RETAIN_CREDENTIALS)
    .do(action => {
      const connection = getActiveConnectionData(store.getState())
      if (
        !action.shouldRetain &&
        (connection.username || connection.password)
      ) {
        memoryUsername = connection.username
        memoryPassword = connection.password
        connection.username = ''
        connection.password = ''
        return store.dispatch(updateConnection(connection))
      }
      if (action.shouldRetain && memoryUsername && memoryPassword) {
        connection.username = memoryUsername
        connection.password = memoryPassword
        memoryUsername = ''
        memoryPassword = ''
        return store.dispatch(updateConnection(connection))
      }
    })
    .mapTo({ type: 'NOOP' })
}
