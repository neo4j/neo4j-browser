/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import { isConfigValFalsy } from 'services/bolt/boltHelpers'
import { APP_START } from 'shared/modules/app/appDuck'
import {
  CONNECTED_STATE,
  CONNECTION_SUCCESS,
  connectionLossFilter,
  DISCONNECTION_SUCCESS,
  LOST_CONNECTION,
  UPDATE_CONNECTION_STATE,
  setRetainCredentials,
  setAuthEnabled,
  onLostConnection,
  getUseDb,
  useDb
} from 'shared/modules/connections/connectionsDuck'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { getBackgroundTxMetadata } from 'shared/services/bolt/txMetadata'
import {
  canSendTxMetadata,
  getDbClusterRole
} from '../features/versionedFeatures'
import { extractServerInfo } from './dbMeta.utils'
import { assign, reduce } from 'lodash-es'
import {
  hasClientConfig,
  updateUserCapability,
  USER_CAPABILITIES,
  FEATURE_DETECTION_DONE
} from '../features/featuresDuck'

export const NAME = 'meta'
export const UPDATE = 'meta/UPDATE'
export const UPDATE_META = 'meta/UPDATE_META'
export const UPDATE_SERVER = 'meta/UPDATE_SERVER'
export const FETCH_SERVER_INFO = 'meta/FETCH_SERVER_INFO'
export const UPDATE_SETTINGS = 'meta/UPDATE_SETTINGS'
export const CLEAR = 'meta/CLEAR'
export const FORCE_FETCH = 'meta/FORCE_FETCH'
export const DB_META_DONE = 'meta/DB_META_DONE'

export const SYSTEM_DB = 'system'

/**
 * Selectors
 */
export function getMetaInContext(state, context) {
  const inCurrentContext = e => e.context === context

  const labels = state.labels.filter(inCurrentContext)
  const relationshipTypes = state.relationshipTypes.filter(inCurrentContext)
  const properties = state.properties.filter(inCurrentContext)
  const functions = state.functions.filter(inCurrentContext)
  const procedures = state.procedures.filter(inCurrentContext)

  return {
    labels,
    relationshipTypes,
    properties,
    functions,
    procedures
  }
}

export const getVersion = state =>
  (state[NAME] || {}).server ? (state[NAME] || {}).server.version : 0
export const getEdition = state => state[NAME].server.edition
export const getStoreSize = state => state[NAME].server.storeSize
export const getClusterRole = state => state[NAME].role
export const isEnterprise = state => state[NAME].server.edition === 'enterprise'
export const isBeta = state => /-/.test(state[NAME].server.version)
export const getStoreId = state => state[NAME].server.storeId

export const getAvailableSettings = state =>
  (state[NAME] || initialState).settings
export const allowOutgoingConnections = state =>
  getAvailableSettings(state)['browser.allow_outgoing_connections']
export const credentialsTimeout = state =>
  getAvailableSettings(state)['browser.credential_timeout'] || 0
export const getRemoteContentHostnameWhitelist = state =>
  getAvailableSettings(state)['browser.remote_content_hostname_whitelist'] ||
  initialState.settings['browser.remote_content_hostname_whitelist']
export const getDefaultRemoteContentHostnameWhitelist = () =>
  initialState.settings['browser.remote_content_hostname_whitelist']
export const shouldRetainConnectionCredentials = state => {
  const settings = getAvailableSettings(state)
  const conf = settings['browser.retain_connection_credentials']
  if (conf === null || typeof conf === 'undefined') return true
  return !isConfigValFalsy(conf)
}
export const getDatabases = state => (state[NAME] || initialState).databases
export const getActiveDbName = state =>
  ((state[NAME] || {}).settings || {})['dbms.active_database']
/**
 * Helpers
 */

function updateMetaForContext(state, meta, context) {
  if (!meta || !meta.records || !meta.records.length) {
    return {
      labels: initialState.labels,
      relationshipTypes: initialState.relationshipTypes,
      properties: initialState.properties,
      functions: initialState.functions,
      procedures: initialState.procedures,
      nodes: initialState.nodes,
      relationships: initialState.relationships
    }
  }
  const notInCurrentContext = e => e.context !== context
  const mapResult = (metaIndex, mapFunction) =>
    meta.records[metaIndex].get(0).data.map(mapFunction)
  const mapSingleValue = r => ({ val: r, context })
  const mapInteger = r => (bolt.neo4j.isInt(r) ? r.toNumber() || 0 : r || 0)
  const mapInvocableValue = r => {
    const { name, signature, description } = r
    return {
      val: name,
      context,
      signature,
      description
    }
  }

  const compareMetaItems = (a, b) =>
    a.val < b.val ? -1 : a.val > b.val ? 1 : 0

  const labels = state.labels
    .filter(notInCurrentContext)
    .concat(mapResult(0, mapSingleValue))
    .sort(compareMetaItems)
  const relationshipTypes = state.relationshipTypes
    .filter(notInCurrentContext)
    .concat(mapResult(1, mapSingleValue))
    .sort(compareMetaItems)
  const properties = state.properties
    .filter(notInCurrentContext)
    .concat(mapResult(2, mapSingleValue))
    .sort(compareMetaItems)
  const functions = state.functions
    .filter(notInCurrentContext)
    .concat(mapResult(3, mapInvocableValue))
  const procedures = state.procedures
    .filter(notInCurrentContext)
    .concat(mapResult(4, mapInvocableValue))
  const nodes = meta.records[5]
    ? mapInteger(meta.records[5].get(0).data)
    : state.nodes
  const relationships = meta.records[6]
    ? mapInteger(meta.records[6].get(0).data)
    : state.relationships

  return {
    labels,
    relationshipTypes,
    properties,
    functions,
    procedures,
    nodes,
    relationships
  }
}

// Initial state
const initialState = {
  nodes: 0,
  relationships: 0,
  labels: [],
  relationshipTypes: [],
  properties: [],
  functions: [],
  procedures: [],
  role: null,
  server: {
    version: null,
    edition: null,
    storeSize: null
  },
  databases: [],
  settings: {
    'browser.allow_outgoing_connections': false,
    'browser.remote_content_hostname_whitelist': 'guides.neo4j.com, localhost',
    'browser.retain_connection_credentials': true
  }
}

/**
 * Reducer
 */
export default function meta(state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case UPDATE:
      const { type, ...rest } = action // eslint-disable-line
      return { ...state, ...rest }
    case UPDATE_META:
      return {
        ...state,
        ...updateMetaForContext(state, action.meta, action.context)
      }
    case UPDATE_SERVER:
      const { type: serverType, ...serverRest } = action
      const serverState = {}
      Object.keys(serverRest).forEach(key => {
        serverState[key] = action[key]
      })
      return {
        ...state,
        server: { ...state.server, ...serverState }
      }
    case UPDATE_SETTINGS:
      return { ...state, settings: { ...action.settings } }
    case CLEAR:
      return { ...initialState }
    default:
      return state
  }
}

// Actions
export function updateMeta(meta, context) {
  return {
    type: UPDATE_META,
    meta,
    context
  }
}
export function fetchMetaData() {
  return {
    type: FORCE_FETCH
  }
}
export function fetchServerInfo() {
  return {
    type: FETCH_SERVER_INFO
  }
}

export const update = obj => {
  return {
    type: UPDATE,
    ...obj
  }
}

export const updateSettings = settings => {
  return {
    type: UPDATE_SETTINGS,
    settings
  }
}

export const updateServerInfo = res => {
  const extrated = extractServerInfo(res)
  return {
    ...extrated,
    type: UPDATE_SERVER
  }
}

// Epics
export const metaQuery = `
CALL db.labels() YIELD label
RETURN {name:'labels', data:COLLECT(label)[..1000]} AS result
UNION ALL
CALL db.relationshipTypes() YIELD relationshipType
RETURN {name:'relationshipTypes', data:COLLECT(relationshipType)[..1000]} AS result
UNION ALL
CALL db.propertyKeys() YIELD propertyKey
RETURN {name:'propertyKeys', data:COLLECT(propertyKey)[..1000]} AS result
UNION ALL
CALL dbms.functions() YIELD name, signature, description
RETURN {name:'functions', data: collect({name: name, signature: signature, description: description})} AS result
UNION ALL
CALL dbms.procedures() YIELD name, signature, description
RETURN {name:'procedures', data:collect({name: name, signature: signature, description: description})} AS result
UNION ALL
MATCH () RETURN { name:'nodes', data:count(*) } AS result
UNION ALL
MATCH ()-[]->() RETURN { name:'relationships', data: count(*)} AS result
`
export const serverInfoQuery =
  'CALL dbms.components() YIELD name, versions, edition'

export const dbMetaEpic = (some$, store) =>
  some$
    .ofType(UPDATE_CONNECTION_STATE)
    .filter(s => s.state === CONNECTED_STATE)
    .merge(some$.ofType(CONNECTION_SUCCESS))
    .mergeMap(() => {
      return (
        Rx.Observable.timer(1, 20000)
          .merge(some$.ofType(FORCE_FETCH))
          // Throw away newly initiated calls until done
          .throttle(() => some$.ofType(DB_META_DONE))
          // Server version and edition
          .do(store.dispatch({ type: FETCH_SERVER_INFO }))
          .mergeMap(() =>
            Rx.Observable.forkJoin([
              // Labels, types and propertyKeys, and server version
              Rx.Observable.of(null).mergeMap(() => {
                const db = getUseDb(store.getState())

                // System db, do nothing
                if (db === SYSTEM_DB) {
                  store.dispatch(updateMeta([]))
                  return Rx.Observable.of(null)
                }

                // Not system db, try and fetch meta data
                return Rx.Observable.fromPromise(
                  bolt.routedReadTransaction(
                    metaQuery,
                    {},
                    {
                      useCypherThread: shouldUseCypherThread(store.getState()),
                      onLostConnection: onLostConnection(store.dispatch),
                      ...getBackgroundTxMetadata({
                        hasServerSupport: canSendTxMetadata(store.getState())
                      })
                    }
                  )
                )
                  .do(res => {
                    if (res) {
                      store.dispatch(updateMeta(res))
                    }
                  })
                  .catch(e => {
                    store.dispatch(updateMeta([]))
                    return Rx.Observable.of(null)
                  })
              }),
              // Cluster role
              Rx.Observable.fromPromise(
                bolt.directTransaction(
                  getDbClusterRole(store.getState()),
                  {},
                  {
                    useCypherThread: shouldUseCypherThread(store.getState()),
                    ...getBackgroundTxMetadata({
                      hasServerSupport: canSendTxMetadata(store.getState())
                    })
                  }
                )
              )
                .catch(e => {
                  return Rx.Observable.of(null)
                })
                .do(res => {
                  if (!res) return Rx.Observable.of(null)
                  const role = res.records[0].get(0)
                  store.dispatch(update({ role }))
                  return Rx.Observable.of(null)
                }),
              // Database list
              Rx.Observable.fromPromise(
                new Promise(async (resolve, reject) => {
                  const supportsMultiDb = await bolt.hasMultiDbSupport()
                  if (!supportsMultiDb) {
                    return resolve(null)
                  }
                  bolt
                    .directTransaction(
                      'SHOW DATABASES',
                      {},
                      {
                        useCypherThread: shouldUseCypherThread(
                          store.getState()
                        ),
                        ...getBackgroundTxMetadata({
                          hasServerSupport: canSendTxMetadata(store.getState())
                        }),
                        useDb: SYSTEM_DB // System db
                      }
                    )
                    .then(resolve)
                    .catch(reject)
                })
              )
                .catch(e => {
                  return Rx.Observable.of(null)
                })
                .do(res => {
                  if (!res) return Rx.Observable.of(null)
                  const databases = res.records.map(record => ({
                    ...reduce(
                      record.keys,
                      (agg, key) => assign(agg, { [key]: record.get(key) }),
                      {}
                    ),
                    status: record.get('currentStatus')
                  }))

                  store.dispatch(update({ databases }))

                  // Currently not using a db
                  if (!getUseDb(store.getState())) {
                    const defaultDb = databases.filter(db => db.default)
                    if (defaultDb.length) {
                      store.dispatch(useDb(defaultDb[0].name))
                    }
                  }
                  return Rx.Observable.of(null)
                })
            ])
          )
          .takeUntil(
            some$
              .ofType(LOST_CONNECTION)
              .filter(connectionLossFilter)
              .merge(some$.ofType(DISCONNECTION_SUCCESS))
          )
          .mapTo({ type: DB_META_DONE })
      )
    })

export const serverConfigEpic = (some$, store) =>
  some$
    .ofType(FEATURE_DETECTION_DONE)
    .merge(some$.ofType(DB_META_DONE))
    .mergeMap(() => {
      // Server configuration
      return Rx.Observable.fromPromise(
        new Promise(async (resolve, reject) => {
          const supportsMultiDb = await bolt.hasMultiDbSupport()
          bolt
            .directTransaction(
              `CALL ${
                hasClientConfig(store.getState())
                  ? 'dbms.clientConfig()'
                  : 'dbms.listConfig()'
              }`,

              {},
              {
                useDb: supportsMultiDb ? SYSTEM_DB : '',
                useCypherThread: shouldUseCypherThread(store.getState()),
                ...getBackgroundTxMetadata({
                  hasServerSupport: canSendTxMetadata(store.getState())
                })
              }
            )
            .then(resolve)
            .catch(reject)
        })
      )
        .catch(e => {
          store.dispatch(
            updateUserCapability(USER_CAPABILITIES.serverConfigReadable, false)
          )
          return Rx.Observable.of(null)
        })
        .do(res => {
          if (!res) return Rx.Observable.of(null)
          const settings = res.records.reduce((all, record) => {
            const name = record.get('name')
            let value = record.get('value')
            if (name === 'browser.retain_connection_credentials') {
              let retainCredentials = true
              // Check if we should wipe user creds from localstorage
              if (typeof value !== 'undefined' && isConfigValFalsy(value)) {
                retainCredentials = false
              }
              store.dispatch(setRetainCredentials(retainCredentials))
              value = retainCredentials
            } else if (name === 'browser.allow_outgoing_connections') {
              // Use isConfigValFalsy to cast undefined to true
              value = !isConfigValFalsy(value)
            } else if (name === 'dbms.security.auth_enabled') {
              let authEnabled = true
              if (typeof value !== 'undefined' && isConfigValFalsy(value)) {
                authEnabled = false
              }
              value = authEnabled
              store.dispatch(setAuthEnabled(authEnabled))
            }
            all[name] = value
            return all
          }, {})
          store.dispatch(
            updateUserCapability(USER_CAPABILITIES.serverConfigReadable, true)
          )
          store.dispatch(updateSettings(settings))
          return Rx.Observable.of(null)
        })
    })
    .mapTo({ type: 'SERVER_CONFIG_DONE' })

export const serverInfoEpic = (some$, store) =>
  some$
    .ofType(FETCH_SERVER_INFO)
    .mergeMap(() => {
      const state = store.getState()
      const db = getUseDb(state)
      const query = db === SYSTEM_DB ? 'SHOW DATABASES' : serverInfoQuery
      return Rx.Observable.fromPromise(
        bolt.directTransaction(
          query,
          {},
          {
            useCypherThread: shouldUseCypherThread(store.getState()),
            ...getBackgroundTxMetadata({
              hasServerSupport: canSendTxMetadata(store.getState())
            })
          }
        )
      )
        .catch(e => {
          return Rx.Observable.of(null)
        })
        .do(res => {
          if (!res) return Rx.Observable.of(null)

          store.dispatch(updateServerInfo(res))
          return Rx.Observable.of(null)
        })
    })
    .mapTo({ type: 'NOOP' })

export const clearMetaOnDisconnectEpic = (some$, store) =>
  some$.ofType(DISCONNECTION_SUCCESS).mapTo({ type: CLEAR })
