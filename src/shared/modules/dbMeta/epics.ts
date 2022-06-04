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
import { assign, reduce } from 'lodash-es'
import Rx from 'rxjs/Rx'

import {
  USER_CAPABILITIES,
  hasClientConfig,
  setClientConfig,
  updateUserCapability
} from '../features/featuresDuck'
import { getDbClusterRole } from '../features/versionedFeatures'
import { update, updateMeta, updateServerInfo, updateSettings } from './actions'
import {
  CLEAR_META,
  DB_META_DONE,
  FORCE_FETCH,
  SYSTEM_DB,
  metaQuery,
  serverInfoQuery
} from './constants'
import {
  Database,
  findDatabaseByNameOrAlias,
  getDatabases,
  getSemanticVersion,
  shouldRetainEditorHistory
} from './state'
import bolt from 'services/bolt/bolt'
import { isConfigValFalsy } from 'services/bolt/boltHelpers'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  CONNECTED_STATE,
  CONNECTION_SUCCESS,
  DISCONNECTION_SUCCESS,
  LOST_CONNECTION,
  SILENT_DISCONNECT,
  UPDATE_CONNECTION_STATE,
  connectionLossFilter,
  getActiveConnectionData,
  getLastUseDb,
  getUseDb,
  onLostConnection,
  setAuthEnabled,
  setRetainCredentials,
  updateConnection,
  useDb
} from 'shared/modules/connections/connectionsDuck'
import { clearHistory } from 'shared/modules/history/historyDuck'
import { backgroundTxMetadata } from 'shared/services/bolt/txMetadata'
import { isOnCausalCluster } from 'shared/utils/selectors'
import {
  getListFunctionQuery,
  getListProcedureQuery
} from '../cypher/functionsAndProceduresHelper'

async function databaseList(store: any) {
  try {
    const supportsMultiDb = await bolt.hasMultiDbSupport()
    if (!supportsMultiDb) {
      return
    }

    const res = await bolt.directTransaction(
      'SHOW DATABASES',
      {},
      {
        ...backgroundTxMetadata,
        useDb: SYSTEM_DB
      }
    )

    if (!res) return

    const databases = res.records.map((record: any) => ({
      ...reduce(
        record.keys,
        (agg, key) => assign(agg, { [key]: record.get(key) }),
        {}
      ),

      status: record.get('currentStatus')
    }))

    store.dispatch(update({ databases }))
  } catch {}
}

async function getLabelsAndTypes(store: any) {
  const db = getUseDb(store.getState())

  // System db, do nothing
  if (db === SYSTEM_DB) {
    store.dispatch(updateMeta([]))
    return
  }

  // Not system db, try and fetch meta data
  try {
    const res = await bolt.routedReadTransaction(
      metaQuery,
      {},
      {
        onLostConnection: onLostConnection(store.dispatch),
        ...backgroundTxMetadata
      }
    )
    if (res) {
      store.dispatch(updateMeta(res))
    }
  } catch {
    store.dispatch(updateMeta([]))
  }
}

async function getFunctionsAndProcedures(store: any) {
  const version = getSemanticVersion(store)
  try {
    const procedurePromise = bolt.routedReadTransaction(
      getListProcedureQuery(version),
      {},
      backgroundTxMetadata
    )
    const functionPromise = bolt.routedReadTransaction(
      getListFunctionQuery(version),
      {},
      backgroundTxMetadata
    )
    const [procedures, functions] = await Promise.all([
      procedurePromise,
      functionPromise
    ])

    store.dispatch(
      update({
        procedures: procedures.records.map(p => p.toObject()),
        functions: functions.records.map(f => f.toObject())
      })
    )
  } catch (e) {}
}

async function clusterRole(store: any) {
  if (!isOnCausalCluster(store.getState())) {
    return
  }

  const res = await bolt.directTransaction(
    getDbClusterRole(store.getState()),
    {},
    backgroundTxMetadata
  )

  if (!res) return Rx.Observable.of(null)

  const role = res.records[0].get(0)
  store.dispatch(update({ role }))
  return Rx.Observable.of(null)
}

async function fetchServerInfo(store: any) {
  try {
    const serverInfo = await bolt.directTransaction(
      serverInfoQuery,
      {},
      backgroundTxMetadata
    )
    store.dispatch(updateServerInfo(serverInfo))
  } catch {}
}

const switchToRequestedDb = (store: any) => {
  if (getUseDb(store.getState())) return

  const databases = getDatabases(store.getState())
  const activeConnection = getActiveConnectionData(store.getState())
  const requestedUseDb = activeConnection?.requestedUseDb

  const switchToLastUsedOrDefaultDb = () => {
    const lastUsedDb = getLastUseDb(store.getState())
    if (lastUsedDb && findDatabaseByNameOrAlias(store.getState(), lastUsedDb)) {
      store.dispatch(useDb(lastUsedDb))
    } else {
      const homeDb = databases.find(db => db.home)
      if (homeDb) {
        store.dispatch(useDb(homeDb.name))
      } else {
        const defaultDb = databases.find(db => db.default)
        if (defaultDb) {
          store.dispatch(useDb(defaultDb.name))
        } else {
          const systemDb = databases.find(db => db.name === SYSTEM_DB)
          if (systemDb) {
            store.dispatch(useDb(systemDb.name))
          } else {
            if (databases.length > 0) {
              store.dispatch(useDb(databases[0].name))
            }
          }
        }
      }
    }
  }

  if (activeConnection && requestedUseDb) {
    const wantedDb = databases.find(
      ({ name }: Database) =>
        name.toLowerCase() === requestedUseDb.toLowerCase()
    )
    store.dispatch(
      updateConnection({
        id: activeConnection.id,
        requestedUseDb: ''
      })
    )
    if (wantedDb) {
      store.dispatch(useDb(wantedDb.name))
      // update labels and such for new db
      getLabelsAndTypes(store)
    } else {
      // this will show the db not found frame
      store.dispatch(executeCommand(`:use ${requestedUseDb}`), {
        source: commandSources.auto
      })
      switchToLastUsedOrDefaultDb()
    }
  } else {
    switchToLastUsedOrDefaultDb()
  }
}

export const dbMetaEpic = (some$: any, store: any) =>
  some$
    .ofType(UPDATE_CONNECTION_STATE)
    .filter((s: any) => s.state === CONNECTED_STATE)
    .merge(some$.ofType(CONNECTION_SUCCESS))
    .mergeMap(() =>
      Rx.Observable.fromPromise(
        // Server version and edition
        fetchServerInfo(store)
      )
    )
    .mergeMap(() =>
      Rx.Observable.timer(1, 20000)
        .merge(some$.ofType(FORCE_FETCH))
        // Throw away newly initiated calls until done
        .throttle(() => some$.ofType(DB_META_DONE))
        .mergeMap(() =>
          Rx.Observable.fromPromise(
            Promise.all([
              getLabelsAndTypes(store),
              getFunctionsAndProcedures(store),
              clusterRole(store),
              databaseList(store)
            ])
          )
        )
        .takeUntil(
          some$
            .ofType(LOST_CONNECTION)
            .filter(connectionLossFilter)
            .merge(some$.ofType(DISCONNECTION_SUCCESS))
            .merge(some$.ofType(SILENT_DISCONNECT))
        )
        .do(() => switchToRequestedDb(store))
        .mapTo({ type: DB_META_DONE })
    )

export const serverConfigEpic = (some$: any, store: any) =>
  some$
    .ofType(DB_META_DONE)
    .mergeMap(() => {
      // Server configuration
      return Rx.Observable.fromPromise(
        new Promise(async (resolve, reject) => {
          let supportsMultiDb: boolean
          try {
            supportsMultiDb = await bolt.hasMultiDbSupport()
          } catch (e) {
            // if hasMultiDbSupport throws there's no instance of neo4j running anymore
            onLostConnection(store.dispatch)(e)
            return reject(e)
          }

          bolt
            .directTransaction(
              `CALL ${
                hasClientConfig(store.getState()) !== false
                  ? 'dbms.clientConfig()'
                  : 'dbms.listConfig()'
              }`,
              {},
              {
                useDb: supportsMultiDb ? SYSTEM_DB : '',
                ...backgroundTxMetadata
              }
            )
            .then((r: any) => {
              // This is not set yet
              if (hasClientConfig(store.getState()) === null) {
                store.dispatch(setClientConfig(true))
              }
              resolve(r)
            })
            .catch((e: any) => {
              // Try older procedure if the new one doesn't exist
              if (e.code === 'Neo.ClientError.Procedure.ProcedureNotFound') {
                // Store that dbms.clientConfig isn't available
                store.dispatch(setClientConfig(false))

                bolt
                  .directTransaction(
                    `CALL dbms.listConfig()`,
                    {},
                    {
                      useDb: supportsMultiDb ? SYSTEM_DB : '',
                      ...backgroundTxMetadata
                    }
                  )
                  .then(resolve)
                  .catch(reject)
              } else {
                reject(e)
              }
            })
        })
      )
        .catch(() => {
          store.dispatch(
            updateUserCapability(USER_CAPABILITIES.serverConfigReadable, false)
          )
          return Rx.Observable.of(null)
        })
        .do((res: any) => {
          if (!res) return Rx.Observable.of(null)
          const settings = res.records.reduce((all: any, record: any) => {
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
            } else if (name === 'browser.retain_editor_history') {
              let retainHistory = true
              // Check if we should wipe user history from localstorage
              if (typeof value !== 'undefined' && isConfigValFalsy(value)) {
                retainHistory = false
              }
              value = retainHistory
            } else if (name === 'browser.allow_outgoing_connections') {
              // Use isConfigValFalsy to cast undefined to true
              value = !isConfigValFalsy(value)
            } else if (name === 'clients.allow_telemetry') {
              value = !isConfigValFalsy(value)
            } else if (name === 'dbms.security.auth_enabled') {
              let authEnabled = true
              if (typeof value !== 'undefined' && isConfigValFalsy(value)) {
                authEnabled = false
              }
              value = authEnabled
              store.dispatch(setAuthEnabled(authEnabled))
            } else if (name === 'metrics.namespaces.enabled') {
              let metricsNamespacesEnabled = true
              if (typeof value !== 'undefined' && isConfigValFalsy(value)) {
                metricsNamespacesEnabled = false
              }
              value = metricsNamespacesEnabled
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
    .do(() => store.dispatch(update({ serverConfigDone: true })))
    .mapTo({ type: 'SERVER_CONFIG_DONE' })

export const clearMetaOnDisconnectEpic = (some$: any, store: any) =>
  some$
    .ofType(DISCONNECTION_SUCCESS)
    .merge(some$.ofType(SILENT_DISCONNECT))
    .do(() => {
      if (!shouldRetainEditorHistory(store.getState())) {
        store.dispatch(clearHistory())
      }
      return Rx.Observable.of(null)
    })
    .mapTo({ type: CLEAR_META })
