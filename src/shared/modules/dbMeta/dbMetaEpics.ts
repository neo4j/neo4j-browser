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
import {
  update,
  updateServerInfo,
  updateSettings,
  CLEAR_META,
  DB_META_DONE,
  FORCE_FETCH,
  SYSTEM_DB,
  metaTypesQuery,
  serverInfoQuery,
  VERSION_FOR_CLUSTER_ROLE_IN_SHOW_DB,
  isOnCluster,
  updateCountAutomaticRefresh,
  getCountAutomaticRefreshEnabled,
  DB_META_FORCE_COUNT,
  DB_META_COUNT_DONE,
  metaCountQuery
} from './dbMetaDuck'
import {
  ClientSettings,
  initialClientSettings,
  Database,
  findDatabaseByNameOrAlias,
  getDatabases,
  getSemanticVersion,
  shouldRetainEditorHistory
} from './dbMetaDuck'
import bolt from 'services/bolt/bolt'
import { isConfigValFalsy, isConfigValTruthy } from 'services/bolt/boltHelpers'
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
import {
  getListFunctionQuery,
  getListProcedureQuery
} from '../cypher/functionsAndProceduresHelper'
import { isInt, Record } from 'neo4j-driver'
import semver, { gte, SemVer } from 'semver'
import { triggerCredentialsTimeout } from '../credentialsPolicy/credentialsPolicyDuck'
getCountAutomaticRefreshEnabled
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
    return
  }

  // Not system db, try and fetch meta data
  try {
    const res = await bolt.routedReadTransaction(
      metaTypesQuery,
      {},
      {
        onLostConnection: onLostConnection(store.dispatch),
        ...backgroundTxMetadata
      }
    )
    if (res && res.records && res.records.length !== 0) {
      const [rawLabels, rawRelTypes, rawProperties] = res.records.map(
        (r: Record) => r.get(0).data
      )

      const compareMetaItems = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0)
      const labels = rawLabels.sort(compareMetaItems)
      const relationshipTypes = rawRelTypes.sort(compareMetaItems)
      const properties = rawProperties.sort(compareMetaItems)

      store.dispatch(
        update({
          labels,
          properties,
          relationshipTypes
        })
      )
    }
  } catch {}
}

async function getNodeAndRelationshipCounts(store: any) {
  const db = getUseDb(store.getState())

  // System db, do nothing
  if (db === SYSTEM_DB) {
    return
  }

  // Not system db, try and fetch meta data
  try {
    const res = await bolt.routedReadTransaction(
      metaCountQuery,
      {},
      {
        onLostConnection: onLostConnection(store.dispatch),
        ...backgroundTxMetadata
      }
    )
    if (res && res.records && res.records.length !== 0) {
      const [rawNodeCount, rawRelationshipCount] = res.records.map(
        (r: Record) => r.get(0).data
      )

      const neo4jIntegerToNumber = (r: any) =>
        isInt(r) ? r.toNumber() || 0 : r || 0

      const nodes = neo4jIntegerToNumber(rawNodeCount)
      const relationships = neo4jIntegerToNumber(rawRelationshipCount)
      store.dispatch(
        update({
          nodes,
          relationships
        })
      )
    }
  } catch {}
}

async function getFunctionsAndProcedures(store: any) {
  const version = getSemanticVersion(store.getState())
  const supportsMultiDb = await bolt.hasMultiDbSupport()
  try {
    const procedurePromise = bolt.routedReadTransaction(
      getListProcedureQuery(version),
      {},
      {
        ...backgroundTxMetadata,
        useDb: supportsMultiDb ? SYSTEM_DB : undefined
      }
    )
    const functionPromise = bolt.routedReadTransaction(
      getListFunctionQuery(version),
      {},
      {
        ...backgroundTxMetadata,
        useDb: supportsMultiDb ? SYSTEM_DB : undefined
      }
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
  if (!isOnCluster(store.getState())) {
    return
  }

  const version = getSemanticVersion(store.getState())
  if (version && gte(version, VERSION_FOR_CLUSTER_ROLE_IN_SHOW_DB)) {
    // No need to query for the cluster role anymore since it's available in the data from SHOW DATABASES
    return
  }

  const res = await bolt.directTransaction(
    getDbClusterRole(store.getState()),
    {},
    backgroundTxMetadata
  )

  if (!res) return

  const role = res.records[0].get(0)
  store.dispatch(update({ role }))
}

async function fetchServerInfo(store: any) {
  try {
    const serverInfo = await bolt.directTransaction(
      serverInfoQuery,
      {},
      {
        ...backgroundTxMetadata,
        useDb: (await bolt.hasMultiDbSupport()) ? SYSTEM_DB : undefined
      }
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
        .do(() => {
          // Cluster setups where the default database is unavailable,
          // get labels and types takes a long time to finish and it shouldn't
          // be blocking the rest of the bootup process, so we don't await the promise
          getLabelsAndTypes(store)
        })
        .mergeMap(() =>
          Rx.Observable.fromPromise(
            Promise.all([
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
export const dbCountEpic = (some$: any, store: any) =>
  some$
    .ofType(DB_META_DONE)
    .filter(() => getCountAutomaticRefreshEnabled(store.getState()))
    .merge(some$.ofType(DB_META_FORCE_COUNT))
    .throttle(() => some$.ofType(DB_META_COUNT_DONE))
    .mergeMap(() =>
      Rx.Observable.fromPromise<void>(
        new Promise(async resolve => {
          store.dispatch(updateCountAutomaticRefresh({ loading: true }))
          if (getCountAutomaticRefreshEnabled(store.getState())) {
            const startTime = performance.now()
            await getNodeAndRelationshipCounts(store)
            const timeTaken = performance.now() - startTime

            if (timeTaken > 2000) {
              store.dispatch(updateCountAutomaticRefresh({ enabled: false }))
            }
          } else {
            await getNodeAndRelationshipCounts(store)
          }

          store.dispatch(updateCountAutomaticRefresh({ loading: false }))
          resolve()
        })
      )
    )
    .mapTo({ type: DB_META_COUNT_DONE })

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

          const neo4jVersion = getSemanticVersion(store.getState())

          const rawSettings = res.records.reduce((all: any, record: any) => {
            const name = record.get('name')
            all[name] = record.get('value')
            return all
          }, {})

          const settings: ClientSettings = cleanupSettings(
            rawSettings,
            neo4jVersion
          )

          // side-effects
          store.dispatch(
            setRetainCredentials(settings.retainConnectionCredentials)
          )
          store.dispatch(setAuthEnabled(settings.authEnabled))

          store.dispatch(
            updateUserCapability(USER_CAPABILITIES.serverConfigReadable, true)
          )
          store.dispatch(updateSettings(settings))
          if (!store.getState().meta.serverConfigDone) {
            // Trigger a credentials timeout since the settings have just been read from the server for the first time and might be different from the defaults.
            store.dispatch(triggerCredentialsTimeout())
          }

          return Rx.Observable.of(null)
        })
    })
    .do(() => store.dispatch(update({ serverConfigDone: true })))
    .mapTo({ type: 'SERVER_CONFIG_DONE' })

export const cleanupSettings = (
  rawSettings: any,
  neo4jVersion: SemVer | null
) => {
  const settings: ClientSettings = {
    allowOutgoingConnections: !isConfigValFalsy(
      rawSettings['browser.allow_outgoing_connections']
    ), // default true
    credentialTimeout: rawSettings['browser.credential_timeout'] || 0,
    postConnectCmd: rawSettings['browser.post_connect_cmd'] || '',
    remoteContentHostnameAllowlist:
      rawSettings['browser.remote_content_hostname_whitelist'] ||
      initialClientSettings.remoteContentHostnameAllowlist,
    retainConnectionCredentials: !isConfigValFalsy(
      rawSettings['browser.retain_connection_credentials']
    ), // default true
    retainEditorHistory: !isConfigValFalsy(
      rawSettings['browser.retain_editor_history']
    ), // default true
    // Info: clients.allow_telemetry in versions < 5.0, client.allow_telemetry in versions >= 5.0
    allowTelemetry: !(
      isConfigValFalsy(rawSettings['clients.allow_telemetry']) ||
      isConfigValFalsy(rawSettings['client.allow_telemetry'])
    ), // default true
    authEnabled: !isConfigValFalsy(rawSettings['dbms.security.auth_enabled']), // default true
    // Info: in versions < 5.0 exists and defaults to false, in versions >= 5.0 is removed and always true
    metricsNamespacesEnabled:
      neo4jVersion && semver.satisfies(neo4jVersion, '<5.0.0')
        ? isConfigValTruthy(rawSettings['metrics.namespaces.enabled'])
        : true,
    metricsPrefix:
      rawSettings['metrics.prefix'] ??
      rawSettings['server.metrics.prefix'] ??
      initialClientSettings.metricsPrefix
  }

  return settings
}

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
