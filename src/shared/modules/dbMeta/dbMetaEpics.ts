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
  metaCountQuery,
  trialStatusQuery,
  updateTrialStatus,
  oldTrialStatusQuery,
  updateTrialStatusOld,
  isEnterprise,
  SERVER_VERSION_READ,
  supportsMultiDb
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
import { isInt, Record, ResultSummary } from 'neo4j-driver'
import semver, { gte, SemVer } from 'semver'
import { triggerCredentialsTimeout } from '../credentialsPolicy/credentialsPolicyDuck'
import {
  isSystemOrCompositeDb,
  getCurrentDatabase
} from 'shared/utils/selectors'
import { isBoltConnectionErrorCode } from 'services/bolt/boltConnectionErrors'

function handleConnectionError(store: any, e: any) {
  if (!e.code || isBoltConnectionErrorCode(e.code)) {
    onLostConnection(store.dispatch)(e)
  }
}

async function databaseList(store: any) {
  try {
    const hasMultidb = supportsMultiDb(store.getState())
    if (!hasMultidb) {
      return
    }

    const res = await bolt.backgroundWorkerlessRoutedRead(
      'SHOW DATABASES',
      {
        useDb: SYSTEM_DB
      },
      store
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

async function aliasList(store: any) {
  try {
    const hasMultidb = supportsMultiDb(store.getState())
    if (!hasMultidb) {
      return
    }

    const res = await bolt.backgroundWorkerlessRoutedRead(
      'SHOW ALIASES FOR DATABASE',
      { useDb: SYSTEM_DB },
      store
    )

    if (!res) return

    const aliases = res.records.map((record: any) => record.toObject())

    store.dispatch(update({ aliases }))
  } catch {}
}

async function getLabelsAndTypes(store: any) {
  const db = getCurrentDatabase(store.getState())

  // System or composite db, do nothing
  if (db && isSystemOrCompositeDb(db)) {
    return
  }

  // Not system db, try and fetch meta data
  try {
    const res = await bolt.backgroundWorkerlessRoutedRead(
      metaTypesQuery,
      {
        useDb: db?.name
      },
      store
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

async function getNodeAndRelationshipCounts(
  store: any
): Promise<
  { requestSucceeded: false } | { requestSucceeded: true; timeTaken: number }
> {
  const db = getCurrentDatabase(store.getState())

  // System or composite db, do nothing
  if (db && isSystemOrCompositeDb(db)) {
    return { requestSucceeded: false }
  }

  // Not system db, try and fetch meta data
  try {
    const res = await bolt.backgroundWorkerlessRoutedRead(
      metaCountQuery,
      {
        useDb: db?.name
      },
      store
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
      const summary = res.summary as ResultSummary
      return {
        requestSucceeded: true,
        timeTaken:
          summary.resultAvailableAfter.toNumber() +
          summary.resultConsumedAfter.toNumber()
      }
    }
  } catch {}
  return { requestSucceeded: false }
}

async function getFunctionsAndProcedures(store: any) {
  const version = getSemanticVersion(store.getState())
  try {
    const useDb = supportsMultiDb(store.getState()) ? SYSTEM_DB : undefined
    const procedurePromise = bolt.backgroundWorkerlessRoutedRead(
      getListProcedureQuery(version),
      { useDb },
      store
    )
    const functionPromise = bolt.backgroundWorkerlessRoutedRead(
      getListFunctionQuery(version),
      { useDb },
      store
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
  } catch {}
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

  try {
    const res = await bolt.directTransaction(
      getDbClusterRole(store.getState()),
      {},
      backgroundTxMetadata
    )
    if (!res) return

    const role = res.records[0].get(0)
    store.dispatch(update({ role }))
  } catch (e) {
    handleConnectionError(store, e)
  }
}

async function fetchServerInfo(store: any) {
  try {
    const serverInfo = await bolt.backgroundWorkerlessRoutedRead(
      serverInfoQuery,
      // We use the bolt method for multi db support, since don't have the version in redux yet
      { useDb: (await bolt.hasMultiDbSupport()) ? SYSTEM_DB : undefined },
      store
    )
    store.dispatch(updateServerInfo(serverInfo))
  } catch {}
}

async function fetchTrialStatus(store: any) {
  const version = getSemanticVersion(store.getState())
  const enterprise = isEnterprise(store.getState())

  const VERSION_FOR_TRIAL_STATUS = '5.7.0'
  const VERSION_FOR_TRIAL_STATUS_OLD = '5.3.0'

  if (version && enterprise) {
    if (gte(version, VERSION_FOR_TRIAL_STATUS)) {
      try {
        const trialStatus = await bolt.backgroundWorkerlessRoutedRead(
          trialStatusQuery,
          // System database is available from v4
          { useDb: SYSTEM_DB },
          store
        )
        store.dispatch(updateTrialStatus(trialStatus))
      } catch {}
    } else if (gte(version, VERSION_FOR_TRIAL_STATUS_OLD)) {
      try {
        const oldTrialStatus = await bolt.backgroundWorkerlessRoutedRead(
          oldTrialStatusQuery,
          { useDb: SYSTEM_DB },
          store
        )
        store.dispatch(updateTrialStatusOld(oldTrialStatus))
      } catch {}
    }
  }
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

async function pollDbMeta(store: any) {
  try {
    await bolt.quickVerifyConnectivity()
  } catch (e) {
    onLostConnection(store.dispatch)(e)
    return
  }

  // Cluster setups where the default database is unavailable,
  // get labels and types takes a long time to finish and it shouldn't
  // be blocking the rest of the bootup process, so we don't await the promise
  getLabelsAndTypes(store)

  await Promise.all([
    getFunctionsAndProcedures(store),
    clusterRole(store),
    databaseList(store),
    aliasList(store)
  ])
}

export const dbMetaEpic = (some$: any, store: any) =>
  some$
    .ofType(UPDATE_CONNECTION_STATE)
    .filter((s: any) => s.state === CONNECTED_STATE)
    .merge(some$.ofType(CONNECTION_SUCCESS))
    .mergeMap(() =>
      // Server version and edition
      Rx.Observable.fromPromise(fetchServerInfo(store))
    )
    // we don't need to block bootup on fetching trial status, dispatch as side effect
    .do(() => {
      fetchTrialStatus(store)
      store.dispatch({ type: SERVER_VERSION_READ })
    })
    .mergeMap(() =>
      Rx.Observable.timer(1, 20000)
        .merge(some$.ofType(FORCE_FETCH))
        // Throw away newly initiated calls until done
        .throttle(() => some$.ofType(DB_META_DONE))
        .mergeMap(() => Rx.Observable.fromPromise(pollDbMeta(store)))
        .takeUntil(
          some$
            .ofType(LOST_CONNECTION)
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
        (async () => {
          store.dispatch(updateCountAutomaticRefresh({ loading: true }))

          const res = await getNodeAndRelationshipCounts(store)

          const notAlreadyDisabled = getCountAutomaticRefreshEnabled(
            store.getState()
          )
          if (
            res.requestSucceeded &&
            res.timeTaken > 1000 &&
            notAlreadyDisabled
          ) {
            store.dispatch(updateCountAutomaticRefresh({ enabled: false }))
          }

          store.dispatch(updateCountAutomaticRefresh({ loading: false }))
        })()
      )
    )
    .mapTo({ type: DB_META_COUNT_DONE })

export const serverConfigEpic = (some$: any, store: any) =>
  some$
    .ofType(SERVER_VERSION_READ)
    .mergeMap(() => {
      // Server configuration
      return Rx.Observable.fromPromise(
        new Promise(async (resolve, reject) => {
          const useDb = supportsMultiDb(store.getState())
            ? SYSTEM_DB
            : undefined

          bolt
            .backgroundWorkerlessRoutedRead(
              `CALL ${
                hasClientConfig(store.getState()) !== false
                  ? 'dbms.clientConfig()'
                  : 'dbms.listConfig()'
              }`,
              { useDb },
              store
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
                  .backgroundWorkerlessRoutedRead(
                    `CALL dbms.listConfig()`,
                    {
                      useDb
                    },
                    store
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
