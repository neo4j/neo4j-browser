/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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
import { hydrate } from 'services/duckUtils'
import * as discovery from 'shared/modules/discovery/discoveryDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import { getInitCmd, getSettings, getUseBoltRouting, UPDATE as SETTINGS_UPDATE } from 'shared/modules/settings/settingsDuck'
import { USER_CLEAR, APP_START } from 'shared/modules/app/appDuck'

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
export const LOST_CONNECTION = 'connections/LOST_CONNECTION'
export const UPDATE_CONNECTION_STATE = 'connections/UPDATE_CONNECTION_STATE'

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
  let connections = getConnections(state).filter((connection) => connection && connection.id === id)
  if (connections && connections.length > 0) {
    return connections[0]
  } else {
    return null
  }
}

export function getConnections (state) {
  return state[NAME].allConnectionIds.map((id) => state[NAME].connectionsById[id])
}

export function getConnectionState (state) {
  return state[NAME].connectionState || initialState.connectionState
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
  state = hydrate(initialState, state)

  switch (action.type) {
    case ADD:
      return addConnectionHelper(state, action.connection)
    case SET_ACTIVE:
      let cState = CONNECTED_STATE
      if (!action.connectionId) cState = DISCONNECTED_STATE
      return {...state, activeConnection: action.connectionId, connectionState: cState}
    case REMOVE:
      return removeConnectionHelper(state, action.connectionId)
    case MERGE:
      return mergeConnectionHelper(state, action.connection)
    case UPDATE_CONNECTION_STATE:
      return {...state, connectionState: action.state}
    case USER_CLEAR:
      return initialState
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

export const updateConnectionState = (state) => ({
  state,
  type: UPDATE_CONNECTION_STATE
})

const onLostConnection = (dispatch) => (e) => {
  dispatch({ type: LOST_CONNECTION, error: e })
}

export const connectionLossFilter = (action) => {
  const notLostCodes = [
    'Neo.ClientError.Security.Unauthorized',
    'Neo.ClientError.Security.AuthenticationRateLimit'
  ]
  return notLostCodes.indexOf(action.error.code) < 0
}

// Epics
export const connectEpic = (action$, store) => {
  return action$.ofType(CONNECT)
    .mergeMap((action) => {
      if (!action.$$responseChannel) return Rx.Observable.of(null)
      return bolt.openConnection(action, { encrypted: getEncryptionMode() }, onLostConnection(store.dispatch))
        .then((res) => ({ type: action.$$responseChannel, success: true }))
        .catch(([e]) => ({ type: action.$$responseChannel, success: false, error: e }))
    })
}
export const startupConnectEpic = (action$, store) => {
  return action$.ofType(discovery.DONE)
    .mergeMap((action) => {
      const connection = getConnection(store.getState(), discovery.CONNECTION_ID)
      return new Promise((resolve, reject) => {
        bolt.openConnection(connection, { withoutCredentials: true, encrypted: getEncryptionMode() }, onLostConnection(store.dispatch)) // Try without creds
          .then((r) => {
            store.dispatch(discovery.updateDiscoveryConnection({ username: undefined, password: undefined }))
            store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
            resolve({ type: STARTUP_CONNECTION_SUCCESS })
          })
          .catch(() => {
            if (!connection || (!connection.username && !connection.password)) { // No creds stored
              store.dispatch(setActiveConnection(null))
              store.dispatch(discovery.updateDiscoveryConnection({ username: 'neo4j', password: '' }))
              return resolve({ type: STARTUP_CONNECTION_FAILED })
            }
            bolt.openConnection(connection, { encrypted: getEncryptionMode() }, onLostConnection(store.dispatch)) // Try with stored creds
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
  return action$.ofType(DISCONNECT).merge(action$.ofType(USER_CLEAR))
    .do(() => bolt.closeConnection())
    .do((action) => store.dispatch(updateConnection({ id: action.id, password: '' })))
    .mapTo(setActiveConnection(null))
}
export const disconnectSuccessEpic = (action$, store) => {
  return action$.ofType(DISCONNECTION_SUCCESS)
    .mapTo(
      executeSystemCommand(getSettings(store.getState()).cmdchar + 'server connect')
    )
}
export const connectionLostEpic = (action$, store) =>
  action$.ofType(LOST_CONNECTION)
    .filter(connectionLossFilter)
    .throttleTime(5000)
    .do(() => store.dispatch(updateConnectionState(PENDING_STATE)))
    .mergeMap((action) => {
      const connection = getActiveConnectionData(store.getState())
      if (!connection) return Rx.Observable.of(1)
      return Rx.Observable.of(1).mergeMap(() => {
        return new Promise((resolve, reject) => {
          bolt.directConnect(connection, {}, (e) => setTimeout(() => reject('Couldnt reconnect. Lost.'), 4000))
            .then((s) => {
              bolt.closeConnection()
              bolt.openConnection(connection, {}, onLostConnection(store.dispatch))
              .then(() => {
                store.dispatch(updateConnectionState(CONNECTED_STATE))
                resolve()
              }).catch((e) => reject('Error on connect'))
            })
            .catch((e) => setTimeout(() => reject('Couldnt reconnect.'), 4000))
        })
      })
      .retry(5)
      .catch((e) => {
        bolt.closeConnection()
        store.dispatch(setActiveConnection(null))
        return Rx.Observable.of(1)
      })
      .map(() => Rx.Observable.of(1))
    })
    .mapTo({ type: 'NOOP' })

export const checkSettingsForRoutingDriver = (action$, store) => {
  return action$.ofType(SETTINGS_UPDATE).merge(action$.ofType(APP_START))
    .map((action) => {
      bolt.useRoutingConfig(getUseBoltRouting(store.getState()))
      return { type: 'NOOP' }
    })
}
