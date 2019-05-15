/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { getJmxValues, UPDATE_JMX_VALUES } from 'shared/modules/jmx/jmxDuck'
import {
  CONNECTED_STATE,
  CONNECTION_SUCCESS,
  connectionLossFilter,
  DISCONNECTION_SUCCESS,
  LOST_CONNECTION,
  UPDATE_CONNECTION_STATE,
  setRetainCredentials,
  setAuthEnabled,
  onLostConnection
} from 'shared/modules/connections/connectionsDuck'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { getBackgroundTxMetadata } from 'shared/services/bolt/txMetadata'
import {
  canSendTxMetadata,
  hasMultiDbSupport
} from '../features/versionedFeatures'

export const NAME = 'meta'
export const UPDATE = 'meta/UPDATE'
export const UPDATE_META = 'meta/UPDATE_META'
export const UPDATE_SERVER = 'meta/UPDATE_SERVER'
export const UPDATE_SETTINGS = 'meta/UPDATE_SETTINGS'
export const CLEAR = 'meta/CLEAR'
export const FORCE_FETCH = 'meta/FORCE_FETCH'
export const DB_META_DONE = 'meta/DB_META_DONE'

export const SYSTEM_DB = 'system'

/**
 * Selectors
 */
export function getMetaInContext (state, context) {
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
export const getDbName = state => state[NAME].server.dbName
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

/**
 * Helpers
 */

export const getServerConfig = (state, includePrefixes = []) => {
  const confs = getJmxValues(state, [['Configuration']])

  if (!confs) return {}
  const conf = confs[0]
  let filtered
  if (conf) {
    Object.keys(conf)
      .filter(
        key =>
          includePrefixes.length < 1 ||
          includePrefixes.some(pfx => key.startsWith(pfx))
      )
      .forEach(
        key =>
          (filtered = {
            ...filtered,
            [key]: bolt.itemIntToNumber(conf[key].value)
          })
      )
  }
  return filtered || conf
}

function updateMetaForContext (state, meta, context) {
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
    storeId: null,
    dbName: null,
    storeSize: null
  },
  databases: [],
  settings: {
    'browser.allow_outgoing_connections': false,
    'browser.remote_content_hostname_whitelist': 'guides.neo4j.com, localhost'
  }
}

/**
 * Reducer
 */
export default function meta (state = initialState, action) {
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
export function updateMeta (meta, context) {
  return {
    type: UPDATE_META,
    meta,
    context
  }
}
export function fetchMetaData () {
  return {
    type: FORCE_FETCH
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

// Epics
export const metaQuery = `
CALL db.labels() YIELD label
RETURN {name:'labels', data:COLLECT(label)[..1000]} as result
UNION ALL
CALL db.relationshipTypes() YIELD relationshipType
RETURN {name:'relationshipTypes', data:COLLECT(relationshipType)[..1000]} as result
UNION ALL
CALL db.propertyKeys() YIELD propertyKey
RETURN {name:'propertyKeys', data:COLLECT(propertyKey)[..1000]} as result
UNION ALL
CALL dbms.functions() YIELD name, signature, description
RETURN {name:'functions', data: collect({name: name, signature: signature, description: description})} AS result
UNION ALL
CALL dbms.procedures() YIELD name, signature, description
RETURN {name:'procedures', data:collect({name: name, signature: signature, description: description})} as result
UNION ALL
MATCH () RETURN { name:'nodes', data:count(*) } AS result
UNION ALL
MATCH ()-[]->() RETURN { name:'relationships', data: count(*)} AS result
`

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
          // Labels, types and propertyKeys, and server version
          .mergeMap(() =>
            Rx.Observable.fromPromise(
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
            ).catch(e => {
              store.dispatch(updateMeta([]))
              return Rx.Observable.of(null)
            })
          )
          .filter(r => r)
          .do(res => store.dispatch(updateMeta(res)))
          // Server version and edition
          .mergeMap(() =>
            Rx.Observable.fromPromise(
              bolt.directTransaction(
                'CALL dbms.components() YIELD name, versions, edition',
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
                res.records.forEach(record => {
                  const name = record.get('name')
                  const versions = record.get('versions') || []
                  const edition = record.get('edition')
                  if (name === 'Neo4j Kernel') {
                    store.dispatch({
                      type: UPDATE_SERVER,
                      version: versions[0] || 'unknown',
                      edition: edition
                    })
                  }
                })
                return Rx.Observable.of(null)
              })
          )
          // Cluster role
          .mergeMap(() =>
            Rx.Observable.fromPromise(
              bolt.directTransaction(
                'CALL dbms.cluster.role() YIELD role',
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
              })
          )
          // Database list
          .mergeMap(() =>
            Rx.Observable.fromPromise(
              new Promise((resolve, reject) => {
                if (!hasMultiDbSupport(store.getState())) {
                  return resolve(null)
                }
                bolt
                  .directTransaction(
                    'SHOW DATABASES',
                    {},
                    {
                      useCypherThread: shouldUseCypherThread(store.getState()),
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
                const databases = res.records.map(record => {
                  return {
                    name: record.get('name'),
                    status: record.get('status')
                  }
                })
                store.dispatch(update({ databases }))
                return Rx.Observable.of(null)
              })
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
    .ofType(UPDATE_JMX_VALUES)
    // Version and edition
    .do(() => {
      const jmxValueResult = getJmxValues(store.getState(), [
        ['Kernel', 'StoreId'],
        ['Kernel', 'DatabaseName'],
        ['Store file sizes', 'TotalStoreSize']
      ])
      if (
        !jmxValueResult ||
        jmxValueResult.filter(value => !!value).length === 0
      ) {
        return store.dispatch({
          type: UPDATE_SERVER,
          storeId: 'unknown'
        })
      }
      const jmxValues = jmxValueResult.reduce((obj, item) => {
        if (!item) {
          return obj
        }
        const key = Object.keys(item)[0]
        obj[key] = item[key]
        return obj
      }, {})

      const storeId = jmxValues.StoreId
      const dbName = jmxValues.DatabaseName
      const storeSize = jmxValues.TotalStoreSize
      store.dispatch({
        type: UPDATE_SERVER,
        storeId,
        dbName,
        storeSize
      })
    })
    // Server config for browser
    .do(() => {
      const settings = getServerConfig(store.getState(), ['browser.'])
      if (!settings) return
      let retainCredentials = true
      if (
        // Check if we should wipe user creds from localstorage
        typeof settings['browser.retain_connection_credentials'] !==
          'undefined' &&
        isConfigValFalsy(settings['browser.retain_connection_credentials'])
      ) {
        retainCredentials = false
      }

      // This assignment is workaround to have prettier
      // play nice with standardJS
      // Use isConfigValFalsy to cast undefined to true
      const aocConfig = !isConfigValFalsy(
        settings['browser.allow_outgoing_connections']
      )
      settings[`browser.allow_outgoing_connections`] = aocConfig

      store.dispatch(setRetainCredentials(retainCredentials))
      store.dispatch(updateSettings(settings))
    })
    // Server security settings
    .do(() => {
      const settings = getServerConfig(store.getState(), ['dbms.security'])
      if (!settings) return
      const authEnabledSetting = 'dbms.security.auth_enabled'
      let authEnabled = true
      if (
        typeof settings[authEnabledSetting] !== 'undefined' &&
        isConfigValFalsy(settings[authEnabledSetting])
      ) {
        authEnabled = false
      }
      store.dispatch(setAuthEnabled(authEnabled))
    })
    .mapTo({ type: 'NOOP' })

export const clearMetaOnDisconnectEpic = (some$, store) =>
  some$.ofType(DISCONNECTION_SUCCESS).mapTo({ type: CLEAR })
