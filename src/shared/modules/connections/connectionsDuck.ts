/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { authLog, handleRefreshingToken } from 'neo4j-client-sso'
import Rx from 'rxjs/Rx'

import bolt from 'services/bolt/bolt'
import {
  TokenExpiredDriverError,
  UnauthorizedDriverError
} from 'services/bolt/boltConnectionErrors'
import { NATIVE, NO_AUTH, SSO } from 'services/bolt/boltHelpers'
import { GlobalState } from 'shared/globalState'
import { APP_START, USER_CLEAR, inWebEnv } from 'shared/modules/app/appDuck'
import { executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import * as discovery from 'shared/modules/discovery/discoveryDuck'
import {
  getConnectionTimeout,
  getInitCmd,
  getPlayImplicitInitCommands
} from 'shared/modules/settings/settingsDuck'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import { isCloudHost } from 'shared/services/utils'
import { fetchMetaData } from '../dbMeta/dbMetaDuck'

export const NAME = 'connections'
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
export const UPDATE_RETAIN_CREDENTIALS = `connections/UPDATE_RETAIN_CREDENTIALS`
export const UPDATE_AUTH_ENABLED = `connections/UPDATE_AUTH_ENABLED`
export const SWITCH_CONNECTION = `connections/SWITCH_CONNECTION`
export const SWITCH_CONNECTION_SUCCESS = `connections/SWITCH_CONNECTION_SUCCESS`
export const SWITCH_CONNECTION_FAILED = `connections/SWITCH_CONNECTION_FAILED`
export const INITIAL_SWITCH_CONNECTION_FAILED = `connections/INITIAL_SWITCH_CONNECTION_FAILED`
export const VERIFY_CREDENTIALS = `connections/VERIFY_CREDENTIALS`
export const USE_DB = `connections/USE_DB`

export const DISCONNECTED_STATE = 0
export const CONNECTED_STATE = 1
export const PENDING_STATE = 2
export const CONNECTING_STATE = 3

export type ConnectionReduxState = {
  allConnectionIds: string[]
  connectionsById: Record<string, Connection>
  activeConnection: string | null
  connectionState: ConnectionState
  lastUpdate: number
  useDb: string | null
  lastUseDb: string | null
}
export type ConnectionState =
  | typeof DISCONNECTED_STATE
  | typeof CONNECTED_STATE
  | typeof PENDING_STATE
  | typeof CONNECTING_STATE

export type AuthenticationMethod = typeof NATIVE | typeof NO_AUTH | typeof SSO
const onlyValidConnId = discovery.CONNECTION_ID
// we only use one connection, but can't update the redux state
// to match that fact until we've merged proper single sign on
// and sandbox can use that instead of their fork
export type Connection = {
  username: string
  password: string
  id: typeof onlyValidConnId
  db: string | null
  host: string | null
  authEnabled: boolean
  authenticationMethod: AuthenticationMethod
  requestedUseDb?: string
  restApi?: string
  SSOError?: string
  SSOProviders?: SSOProvider[]
}

export const initialState: ConnectionReduxState = {
  allConnectionIds: [],
  connectionsById: {},
  activeConnection: null,
  connectionState: DISCONNECTED_STATE,
  lastUpdate: 0,
  useDb: null,
  lastUseDb: null
}
/**
 * Selectors
 */
export function getConnection(
  state: GlobalState,
  id: string
): Connection | null {
  return (
    getConnections(state).find(
      connection => connection && connection.id === id
    ) || null
  )
}

export function getLastUseDb(state: GlobalState): string | null {
  return (state[NAME] || {}).lastUseDb
}

export function getUseDb(state: GlobalState): string | null {
  return (state[NAME] || {}).useDb
}

export function getConnections(state: GlobalState): Connection[] {
  return Object.values(state[NAME].connectionsById)
}

export function getConnectionState(state: GlobalState): ConnectionState {
  return state[NAME].connectionState || initialState.connectionState
}

export function getLastConnectionUpdate(state: GlobalState): number {
  return state[NAME].lastUpdate || initialState.lastUpdate
}

export function isConnected(state: GlobalState): boolean {
  return getConnectionState(state) === CONNECTED_STATE
}

export function getActiveConnection(state: GlobalState): string | null {
  return state[NAME].activeConnection || initialState.activeConnection
}

export function getActiveConnectionData(state: GlobalState): Connection | null {
  if (!state[NAME].activeConnection) return null
  return getConnectionData(state, state[NAME].activeConnection)
}

export function getAuthEnabled(state: GlobalState): boolean {
  const data = getConnectionData(state, state[NAME].activeConnection)
  return data?.authEnabled ?? true
}

export function getConnectedHost(state: GlobalState): string | null {
  const data = getConnectionData(state, state[NAME].activeConnection)
  return data?.host ?? null
}

export function isConnectedAuraHost(state: GlobalState): boolean {
  const host = getConnectedHost(state)
  return host ? isCloudHost(host, NEO4J_CLOUD_DOMAINS) : false
}

export function getConnectionData(
  state: GlobalState,
  id: string | null
): Connection | null {
  if (!id) return null

  const data = state[NAME].connectionsById[id]
  if (typeof data === 'undefined') return null

  data.db = getUseDb(state)

  if (data.username && data.password) {
    return data
  } else if (memoryUsername && memoryPassword) {
    // No retain state
    return { ...data, username: memoryUsername, password: memoryPassword }
  }

  return data
}

const removeConnectionHelper = (
  state: ConnectionReduxState
): ConnectionReduxState => {
  // Since we only have one connection
  // deleting on is the same as deleting them all
  //We can only have

  return {
    ...state,
    allConnectionIds: [],
    connectionsById: {}
  }
}

const mergeConnectionHelper = (
  state: ConnectionReduxState,
  connection: Connection
): ConnectionReduxState => {
  const { connectionsById } = state
  const currentConnection = connectionsById[onlyValidConnId]
  // Only valid connection we keep now is $$discovery so all
  // merges must result in this state
  return {
    ...state,
    connectionsById: {
      [onlyValidConnId]: {
        ...currentConnection,
        ...connection,
        id: onlyValidConnId
      }
    },
    allConnectionIds: [onlyValidConnId]
  }
}

const updateAuthEnabledHelper = (
  state: ConnectionReduxState,
  authEnabled: boolean
): ConnectionReduxState => {
  const connectionId = state.activeConnection
  if (!connectionId) return state // no connection to update

  const updatedConnection = {
    ...state.connectionsById[connectionId],
    authEnabled
  }

  if (!authEnabled) {
    updatedConnection.username = ''
    updatedConnection.password = ''
  }

  const updatedConnectionByIds = {
    ...state.connectionsById
  }
  updatedConnectionByIds[connectionId] = updatedConnection

  return {
    ...state,
    connectionsById: updatedConnectionByIds
  }
}

// Local vars
let memoryUsername = ''
let memoryPassword = ''

// Reducer
export default function (state = initialState, action: any) {
  switch (action.type) {
    case APP_START:
      return {
        ...initialState,
        ...state,
        useDb: initialState.useDb,
        connectionState: DISCONNECTED_STATE
      }
    case SET_ACTIVE:
      let cState = CONNECTED_STATE
      if (!action.connectionId) cState = DISCONNECTED_STATE
      return {
        ...state,
        activeConnection: action.connectionId,
        connectionState: cState,
        lastUpdate: Date.now()
      }
    case CONNECT:
      return {
        ...state,
        activeConnection: onlyValidConnId,
        connectionState: CONNECTING_STATE,
        lastUpdate: Date.now()
      }
    case REMOVE:
      return removeConnectionHelper(state)
    case MERGE:
      return mergeConnectionHelper(state, action.connection)
    case UPDATE_CONNECTION_STATE:
      return {
        ...state,
        connectionState: action.state,
        lastUpdate: Date.now()
      }
    case UPDATE_AUTH_ENABLED:
      return updateAuthEnabledHelper(state, action.authEnabled)
    case USE_DB:
      const { useDb } = action
      let lastUseDb = useDb
      if (useDb === null) {
        lastUseDb = state.useDb || state.lastUseDb
      }
      return { ...state, lastUseDb, useDb }
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

// Actions
export const selectConnection = (id: any) => {
  return {
    type: SELECT,
    connectionId: id
  }
}

export const setActiveConnection = (id: any, silent = false) => {
  return {
    type: SET_ACTIVE,
    connectionId: id,
    silent
  }
}
export const updateConnection = (connection: any) => {
  return {
    type: MERGE,
    connection
  }
}

export const disconnectAction = (id: string = discovery.CONNECTION_ID) => {
  return {
    type: DISCONNECT,
    id
  }
}

export const updateConnectionState = (state: any) => ({
  state,
  type: UPDATE_CONNECTION_STATE
})

export const onLostConnection = (dispatch: any) => (e: any) => {
  dispatch({ type: LOST_CONNECTION, error: e })
}

export const connectionLossFilter = (action: any) => {
  const notLostCodes = [
    'Neo.ClientError.Security.Unauthorized',
    'Neo.ClientError.Security.AuthenticationRateLimit'
  ]
  return notLostCodes.indexOf(action.error.code) < 0
}

export const setRetainCredentials = (shouldRetain: any) => {
  return {
    type: UPDATE_RETAIN_CREDENTIALS,
    shouldRetain
  }
}

export const setAuthEnabled = (authEnabled: any) => {
  return {
    type: UPDATE_AUTH_ENABLED,
    authEnabled
  }
}

export const useDb = (db: any = null) => ({ type: USE_DB, useDb: db })

export const resetUseDb = () => ({ type: USE_DB, useDb: null })

// Epics
export const useDbEpic = (action$: any, store: any) =>
  action$
    .ofType(USE_DB)
    .do((action: any) => {
      bolt.useDb(action.useDb)
      if (action.useDb) {
        store.dispatch(fetchMetaData())
      }
    })
    .ignoreElements()

export const connectEpic = (action$: any, store: any) =>
  action$.ofType(CONNECT).mergeMap(async (action: any) => {
    if (!action.$$responseChannel) return Rx.Observable.of(null)
    memoryUsername = ''
    memoryPassword = ''
    bolt.closeConnection()
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2000))
    return bolt
      .openConnection(action, {
        connectionTimeout: getConnectionTimeout(store.getState())
      })
      .then(() => {
        if (action.requestedUseDb) {
          store.dispatch(
            updateConnection({
              id: action.id,
              requestedUseDb: action.requestedUseDb
            })
          )
        }
        return {
          type: action.$$responseChannel,
          success: true
        }
      })
      .catch(e => {
        if (!action.noResetConnectionOnFail) {
          store.dispatch(setActiveConnection(null))
        }
        return {
          type: action.$$responseChannel,
          success: false,
          error: e
        }
      })
  })

export const verifyConnectionCredentialsEpic = (action$: any) => {
  return action$.ofType(VERIFY_CREDENTIALS).mergeMap((action: any) => {
    if (!action.$$responseChannel) return Rx.Observable.of(null)
    return bolt
      .directConnect(action, {}, undefined)
      .then(driver => {
        driver.close()
        return { type: action.$$responseChannel, success: true }
      })
      .catch(e => {
        return { type: action.$$responseChannel, success: false, error: e }
      })
  })
}
export type DiscoverableData = {
  username?: string
  password?: string
  requestedUseDb?: string
  restApi?: string
  supportsMultiDb?: boolean
  host?: string
  encrypted?: string
  hasForceUrl?: boolean
  SSOError?: string
  attemptSSOLogin?: boolean
  SSOProviders?: SSOProvider[]
  neo4jVersion?: string
}
export type SSOProvider = {
  id: string
  name: string
  auth_flow: string
  params: {
    client_id: string
    redirect_uri: string
    response_type: string
    scope: string
  }
  auth_endpoint: string
  well_known_discovery_uri: string
}

export type DiscoverDataAction = {
  type: typeof discovery.DONE
  discovered?: DiscoverableData
}

function shouldTryAutoconnecting(conn: Connection | null): boolean {
  return Boolean(
    conn &&
      conn.authenticationMethod !== NO_AUTH &&
      conn.host &&
      conn.username &&
      conn.password
  )
}

export const startupConnectEpic = (action$: any, store: any) => {
  return action$
    .ofType(discovery.DONE)
    .do(() => store.dispatch(resetUseDb()))
    .mergeMap(async ({ discovered }: DiscoverDataAction) => {
      const connectionTimeout = getConnectionTimeout(store.getState())
      const savedConnection = getConnection(
        store.getState(),
        discovery.CONNECTION_ID
      )
      // always update SSO state providers
      store.dispatch(
        discovery.updateDiscoveryConnection({
          SSOProviders: discovered?.SSOProviders || [],
          SSOError: discovered?.SSOError
        })
      )

      if (
        !(discovered && discovered.hasForceUrl) && // If we have force url, don't try old connection data
        shouldTryAutoconnecting(savedConnection)
      ) {
        try {
          await bolt.openConnection(
            savedConnection!,
            { connectionTimeout },
            onLostConnection(store.dispatch)
          )
          store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
          return { type: STARTUP_CONNECTION_SUCCESS }
        } catch {}
      }

      // merge with discovery data if we have any and try again
      if (discovered) {
        store.dispatch(discovery.updateDiscoveryConnection(discovered))
        authLog(
          `discovered these SSO providers: ${JSON.stringify(
            discovered.SSOProviders
          )}`
        )
        const connUpdatedWithDiscovery = getConnection(
          store.getState(),
          discovery.CONNECTION_ID
        )

        if (shouldTryAutoconnecting(connUpdatedWithDiscovery)) {
          // Try connecting
          return new Promise(resolve => {
            // Try to connect with stored creds
            bolt
              .openConnection(
                connUpdatedWithDiscovery!,
                { connectionTimeout },
                onLostConnection(store.dispatch)
              )
              .then(() => {
                store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
                resolve({ type: STARTUP_CONNECTION_SUCCESS })
              })
              .catch(() => {
                store.dispatch(setActiveConnection(null))
                store.dispatch(
                  discovery.updateDiscoveryConnection({
                    username: '',
                    password: '',
                    SSOError: discovered.attemptSSOLogin
                      ? 'SSO token was not accepted by neo4j'
                      : undefined
                  })
                )
                resolve({ type: STARTUP_CONNECTION_FAILED })
              })
          })
        }
      }

      const currentConn = getConnection(
        store.getState(),
        discovery.CONNECTION_ID
      )
      // Otherwise fail autoconnect
      store.dispatch(setActiveConnection(null))
      store.dispatch(
        discovery.updateDiscoveryConnection({
          password: '',
          SSOError: discovered?.SSOError,
          authenticationMethod:
            (currentConn?.SSOProviders?.length ?? 0) > 1
              ? SSO
              : currentConn?.authenticationMethod
        })
      )
      return Promise.resolve({ type: STARTUP_CONNECTION_FAILED })
    })
}

export const startupConnectionSuccessEpic = (action$: any, store: any) => {
  return action$
    .ofType(STARTUP_CONNECTION_SUCCESS)
    .do(() => {
      if (getPlayImplicitInitCommands(store.getState())) {
        store.dispatch(executeSystemCommand(`:server status`))
        store.dispatch(executeSystemCommand(getInitCmd(store.getState())))
      }
    })
    .ignoreElements()
}
export const startupConnectionFailEpic = (action$: any, store: any) => {
  return action$
    .ofType(STARTUP_CONNECTION_FAILED)
    .do(() => {
      store.dispatch(executeSystemCommand(`:server connect`))
    })
    .ignoreElements()
}

let lastActiveConnectionId: string | null = null
export const detectActiveConnectionChangeEpic = (action$: any) => {
  return action$.ofType(SET_ACTIVE).mergeMap((action: any) => {
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
export const disconnectEpic = (action$: any, store: any) => {
  return action$
    .ofType(DISCONNECT)
    .merge(action$.ofType(USER_CLEAR))
    .do(() => bolt.closeConnection())
    .do(() => store.dispatch(resetUseDb()))
    .do((action: any) =>
      store.dispatch(updateConnection({ id: action.id, password: '' }))
    )
    .map(() => setActiveConnection(null))
}
export const silentDisconnectEpic = (action$: any, store: any) => {
  return action$
    .ofType(SILENT_DISCONNECT)
    .do(() => bolt.closeConnection())
    .do(() => store.dispatch(resetUseDb()))
    .mapTo(setActiveConnection(null, true))
}
export const disconnectSuccessEpic = (action$: any) => {
  return action$
    .ofType(DISCONNECTION_SUCCESS)
    .mapTo(executeSystemCommand(':server connect'))
}

export const connectionLostEpic = (action$: any, store: any) =>
  action$
    .ofType(LOST_CONNECTION)
    .filter(connectionLossFilter)
    // Only retry in web env and if we're supposed to be connected
    .filter(() => inWebEnv(store.getState()) && isConnected(store.getState()))
    .throttleTime(5000)
    .do(() => store.dispatch(updateConnectionState(PENDING_STATE)))
    .mergeMap((action: any) => {
      return (
        Rx.Observable.of(1)
          .mergeMap(() => {
            return new Promise(async (resolve, reject) => {
              let connection: Connection | null = null
              if (action.error.code === TokenExpiredDriverError) {
                authLog(
                  'Detected access token expiry, starting refresh attempt'
                )
                const SSOProviders = getActiveConnectionData(
                  store.getState()
                )?.SSOProviders
                if (SSOProviders) {
                  try {
                    const credentials = await handleRefreshingToken(
                      SSOProviders
                    )
                    store.dispatch(
                      discovery.updateDiscoveryConnection(credentials)
                    )
                    connection = getActiveConnectionData(store.getState())
                    authLog(
                      'Successfully refreshed token, attempting to reconnect'
                    )
                  } catch (e) {
                    authLog(`Failed to refresh token: ${e}`)
                  }
                }
              } else {
                connection = getActiveConnectionData(store.getState())
              }
              if (!connection) return reject('No connection object found')

              bolt
                .directConnect(
                  connection,
                  {
                    connectionTimeout: getConnectionTimeout(store.getState())
                  },
                  () =>
                    setTimeout(
                      () => reject(new Error('Couldnt reconnect. Lost.')),
                      5000
                    )
                )
                .then(() => {
                  bolt.closeConnection()
                  bolt
                    .openConnection(
                      connection!,
                      {
                        connectionTimeout: getConnectionTimeout(
                          store.getState()
                        )
                      },
                      onLostConnection(store.dispatch)
                    )
                    .then(() => {
                      store.dispatch(updateConnectionState(CONNECTED_STATE))
                      resolve({ type: 'Success' })
                    })
                    .catch(() => reject(new Error('Error on connect')))
                })
                .catch(e => {
                  // Don't retry if auth failed
                  if (e.code === UnauthorizedDriverError) {
                    resolve({ type: e.code })
                  } else {
                    setTimeout(
                      () => reject(new Error('Couldnt reconnect.')),
                      5000
                    )
                  }
                })
            })
          })
          .retry(10)
          .catch(() => {
            bolt.closeConnection()
            store.dispatch(setActiveConnection(null))
            return Rx.Observable.of(null)
          })
          // It can be resolved for a number of reasons:
          // 1. Connection successful
          // 2. Auth failure
          .do((res: any) => {
            if (!res || res.type === 'Success') {
              return
            }
            // If no connection because of auth failure, close and unset active connection
            if (res.type === UnauthorizedDriverError) {
              bolt.closeConnection()
              store.dispatch(setActiveConnection(null))
            }
          })
          .map(() => Rx.Observable.of(null))
      )
    })
    .ignoreElements()

export const switchConnectionEpic = (action$: any, store: any) => {
  return action$
    .ofType(SWITCH_CONNECTION)
    .do(() => store.dispatch(updateConnectionState(PENDING_STATE)))
    .mergeMap((action: any) => {
      bolt.closeConnection()
      const connectionInfo = { id: discovery.CONNECTION_ID, ...action }
      store.dispatch(updateConnection(connectionInfo))
      return new Promise(resolve => {
        bolt
          .openConnection(
            action,
            { encrypted: action.encrypted },
            onLostConnection(store.dispatch)
          )
          .then(() => {
            store.dispatch(setActiveConnection(discovery.CONNECTION_ID))
            resolve({ type: SWITCH_CONNECTION_SUCCESS })
          })
          .catch(() => {
            store.dispatch(setActiveConnection(null))
            store.dispatch(
              discovery.updateDiscoveryConnection({
                username: 'neo4j',
                password: ''
              })
            )
            resolve({ type: SWITCH_CONNECTION_FAILED })
          })
      })
    })
}

export const switchConnectionSuccessEpic = (action$: any, store: any) => {
  return action$
    .ofType(SWITCH_CONNECTION_SUCCESS)
    .do(() => store.dispatch(updateConnectionState(CONNECTED_STATE)))
    .do(() => store.dispatch(fetchMetaData()))
    .mapTo(executeSystemCommand(':server switch success'))
}
export const switchConnectionFailEpic = (action$: any, store: any) => {
  return action$
    .ofType(SWITCH_CONNECTION_FAILED)
    .do(() => store.dispatch(updateConnectionState(DISCONNECTED_STATE)))
    .mapTo(executeSystemCommand(`:server switch fail`))
}
export const initialSwitchConnectionFailEpic = (action$: any, store: any) => {
  return action$
    .ofType(INITIAL_SWITCH_CONNECTION_FAILED)
    .do(() => {
      store.dispatch(updateConnectionState(DISCONNECTED_STATE))
      if (getPlayImplicitInitCommands(store.getState())) {
        store.dispatch(executeSystemCommand(`:server switch fail`))
      }
    })
    .ignoreElements()
}

export const retainCredentialsSettingsEpic = (action$: any, store: any) => {
  return action$
    .ofType(UPDATE_RETAIN_CREDENTIALS)
    .do((action: any) => {
      const connection = getActiveConnectionData(store.getState())
      if (!connection) {
        return
      }

      if (
        !action.shouldRetain &&
        connection &&
        (connection.username || connection.password)
      ) {
        memoryUsername = connection.username
        memoryPassword = connection.password
        connection.username = ''
        connection.password = ''
        return store.dispatch(updateConnection(connection))
      }
      if (
        action.shouldRetain &&
        memoryUsername &&
        memoryPassword &&
        connection
      ) {
        connection.username = memoryUsername
        connection.password = memoryPassword
        memoryUsername = ''
        memoryPassword = ''
        return store.dispatch(updateConnection(connection))
      }
    })
    .ignoreElements()
}
