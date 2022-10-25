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
import { versionHasEditorHistorySetting } from './utils'
import { isConfigValFalsy } from 'services/bolt/boltHelpers'
import { GlobalState } from 'shared/globalState'
import { APP_START } from 'shared/modules/app/appDuck'
import { extractServerInfo } from './utils'
import { coerce, SemVer, gte } from 'semver'

export const UPDATE_META = 'meta/UPDATE_META'
export const PARSE_META = 'meta/PARSE_META'
export const UPDATE_SERVER = 'meta/UPDATE_SERVER'
export const UPDATE_SETTINGS = 'meta/UPDATE_SETTINGS'
export const CLEAR_META = 'meta/CLEAR'
export const FORCE_FETCH = 'meta/FORCE_FETCH'
export const DB_META_DONE = 'meta/DB_META_DONE'
export const DB_META_COUNT_DONE = 'meta/DB_META_COUNT_DONE'
export const DB_META_FORCE_COUNT = 'meta/DB_FORCE_COUNT'
export const UPDATE_COUNT_AUTOMATIC_REFRESH =
  'meta/UPDATE_COUNT_AUTOMATIC_REFRESH'

export const SYSTEM_DB = 'system'
export const VERSION_FOR_EDITOR_HISTORY_SETTING = '4.3.0'
export const VERSION_FOR_CLUSTER_ROLE_IN_SHOW_DB = '4.3.0'

export const metaTypesQuery = `
CALL db.labels() YIELD label
RETURN {name:'labels', data:COLLECT(label)[..1000]} AS result
UNION ALL
CALL db.relationshipTypes() YIELD relationshipType
RETURN {name:'relationshipTypes', data:COLLECT(relationshipType)[..1000]} AS result
UNION ALL
CALL db.propertyKeys() YIELD propertyKey
RETURN {name:'propertyKeys', data:COLLECT(propertyKey)[..1000]} AS result
`

export const metaCountQuery = `
MATCH () RETURN { name:'nodes', data:count(*) } AS result
UNION ALL
MATCH ()-[]->() RETURN { name:'relationships', data: count(*)} AS result
`

export const serverInfoQuery =
  'CALL dbms.components() YIELD name, versions, edition'

export function fetchMetaData() {
  return {
    type: FORCE_FETCH
  }
}

export function forceCount() {
  return {
    type: DB_META_FORCE_COUNT
  }
}

export const update = (obj: any) => {
  return {
    type: UPDATE_META,
    ...obj
  }
}

export const updateSettings = (settings: ClientSettings) => {
  return {
    type: UPDATE_SETTINGS,
    settings
  }
}

export const updateServerInfo = (res: any) => {
  const extrated = extractServerInfo(res)
  return {
    ...extrated,
    type: UPDATE_SERVER
  }
}

export const updateCountAutomaticRefresh = (countAutomaticRefresh: {
  enabled?: boolean
  loading?: boolean
}) => {
  return {
    type: UPDATE_COUNT_AUTOMATIC_REFRESH,
    countAutomaticRefresh
  }
}

export type Procedure = {
  name: string
  description: string
  signature: string
}

export const NAME = 'meta'

export type ClientSettings = {
  allowOutgoingConnections: boolean
  credentialTimeout: number | string // number (seconds) or duration string (support other units)
  postConnectCmd: string
  remoteContentHostnameAllowlist: string
  retainConnectionCredentials: boolean
  retainEditorHistory: boolean
  allowTelemetry: boolean
  authEnabled: boolean
  metricsNamespacesEnabled: boolean
  metricsPrefix: string
}

/**
 * Initial client settings, used before the actual settings is loaded. Not to be
 * confused with the default values for the setting, since not always the same.
 */
export const initialClientSettings: ClientSettings = {
  allowOutgoingConnections: false, // default is true, but set to false until settings read
  credentialTimeout: 0,
  postConnectCmd: '',
  remoteContentHostnameAllowlist: 'guides.neo4j.com, localhost',
  retainConnectionCredentials: false, // default is true, but set to false until settings read
  retainEditorHistory: false, // default is true, but set to false until settings read
  allowTelemetry: true, // default is true. Renamed to client.allow_telemetry after 5.0
  authEnabled: true, // default is true
  metricsNamespacesEnabled: false, // pre 5.0: default is false, from and after 5.0: settings removed, always true
  metricsPrefix: 'neo4j' // default is 'neo4j', Renamed to server.metrics.prefix after 5.0
}
// Initial state
export const initialState = {
  nodes: 0,
  relationships: 0,
  labels: [],
  relationshipTypes: [],
  properties: [],
  functions: [],
  procedures: [],
  role: null, // Used pre version 4.3 (before SHOW DATABASES had the role and we had to query for it)
  server: {
    version: null,
    edition: null,
    storeSize: null
  },
  databases: [],
  serverConfigDone: false,
  settings: initialClientSettings,
  countAutomaticRefresh: {
    enabled: true,
    loading: false
  }
}

export type Database = {
  name: string
  address: string
  role: string
  requestedStatus: string
  currentStatus: string
  error: string
  default: boolean
  home?: boolean // introduced in neo4j 4.3
  aliases?: string[] // introduced in neo4j 4.4
  status: string
}

// Selectors
export function findDatabaseByNameOrAlias(
  state: GlobalState,
  name: string
): Database | undefined {
  const lowerCaseName = name.toLowerCase()

  return state[NAME].databases.find(
    (db: Database) =>
      db.name.toLowerCase() === lowerCaseName ||
      db.aliases?.find(alias => alias.toLowerCase() === lowerCaseName)
  )
}

export const getRawVersion = (state: GlobalState): string | null =>
  (state[NAME] || {}).server ? (state[NAME] || {}).server.version : null
export const getSemanticVersion = (state: GlobalState): SemVer | null =>
  coerce(getRawVersion(state))
export const getAvailableProcedures = (state: GlobalState): Procedure[] =>
  state[NAME].procedures
export const hasProcedure = (
  state: GlobalState,
  procedureName: string
): boolean =>
  Boolean(getAvailableProcedures(state).find(p => p.name === procedureName))

export const canAssignRolesToUser = (state: any): boolean =>
  hasProcedure(state, 'dbms.security.addRoleToUser')

export const getEdition = (state: GlobalState) => state[NAME].server.edition
export const hasEdition = (state: any) =>
  state[NAME].server.edition !== initialState.server.edition
export const getStoreSize = (state: any) => state[NAME].server.storeSize
export const isEnterprise = (state: any) =>
  ['enterprise'].includes(state[NAME].server.edition)
export const isBeta = (state: any) => /-/.test(state[NAME].server.version)
export const getStoreId = (state: any) =>
  state[NAME] && state[NAME].server ? state[NAME].server.storeId : null
export const isServerConfigDone = (state: GlobalState): boolean =>
  state[NAME].serverConfigDone

export const getAvailableSettings = (state: any): ClientSettings =>
  (state[NAME] || initialState).settings
export const getAllowOutgoingConnections = (state: any) =>
  getAvailableSettings(state).allowOutgoingConnections
export const getClientsAllowTelemetry = (state: GlobalState): boolean =>
  getAvailableSettings(state).allowTelemetry ??
  initialState.settings.allowTelemetry
export const credentialsTimeout = (state: any) =>
  getAvailableSettings(state).credentialTimeout || 0
export const getRemoteContentHostnameAllowlist = (state: GlobalState): string =>
  getAvailableSettings(state).remoteContentHostnameAllowlist
export const getDefaultRemoteContentHostnameAllowlist = (): string =>
  initialState.settings.remoteContentHostnameAllowlist
export const getRetainConnectionCredentials = (state: any) => {
  const settings = getAvailableSettings(state)
  const conf = settings.retainConnectionCredentials
  if (conf === null || typeof conf === 'undefined') return false
  return !isConfigValFalsy(conf)
}
export const getRetainEditorHistory = (state: any) => {
  const settings = getAvailableSettings(state)
  const conf = settings.retainEditorHistory
  if (conf === null || typeof conf === 'undefined') return false
  return !isConfigValFalsy(conf)
}
export const getMetricsNamespacesEnabled = (state: GlobalState): boolean =>
  getAvailableSettings(state).metricsNamespacesEnabled
export const getMetricsPrefix = (state: GlobalState): string =>
  getAvailableSettings(state).metricsPrefix

export const getDatabases = (state: any): Database[] =>
  (state[NAME] || initialState).databases
export const getActiveDbName = (state: any) =>
  ((state[NAME] || {}).settings || {})['dbms.active_database']

export const supportsEditorHistorySetting = (state: any) =>
  isEnterprise(state) && versionHasEditorHistorySetting(getRawVersion(state))

export const shouldAllowOutgoingConnections = (state: any) =>
  (hasEdition(state) && !isEnterprise(state)) ||
  getAllowOutgoingConnections(state)

export const shouldRetainConnectionCredentials = (state: any) =>
  !isEnterprise(state) || getRetainConnectionCredentials(state)

export const shouldRetainEditorHistory = (state: any) =>
  !supportsEditorHistorySetting(state) || getRetainEditorHistory(state)

export const isOnCluster = (state: GlobalState): boolean => {
  const version = getSemanticVersion(state)
  if (!version) return false

  if (gte(version, VERSION_FOR_CLUSTER_ROLE_IN_SHOW_DB)) {
    return getDatabases(state).some(database => database.role !== 'standalone')
  } else {
    return hasProcedure(state, 'dbms.cluster.overview')
  }
}
export const getClusterRoleForDb = (state: GlobalState, activeDb: string) => {
  const version = getSemanticVersion(state)
  if (!version) return false

  if (gte(version, VERSION_FOR_CLUSTER_ROLE_IN_SHOW_DB)) {
    return getDatabases(state).find(database => database.name === activeDb)
      ?.role
  } else {
    return state[NAME].role
  }
}

export const getCountAutomaticRefreshEnabled = (
  state: GlobalState
): boolean => {
  return state[NAME].countAutomaticRefresh.enabled
}

export const getCountAutomaticRefreshLoading = (
  state: GlobalState
): boolean => {
  return state[NAME].countAutomaticRefresh.loading
}

// Reducers
const dbMetaReducer = (
  state = initialState,
  action: any
): typeof initialState => {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state, serverConfigDone: false }
    case UPDATE_META:
      const { type, ...rest } = action
      return { ...state, ...rest }
    case UPDATE_COUNT_AUTOMATIC_REFRESH:
      return {
        ...state,
        countAutomaticRefresh: {
          ...state.countAutomaticRefresh,
          ...action.countAutomaticRefresh
        }
      }
    case UPDATE_SERVER:
      const { type: serverType, ...serverRest } = action
      const serverState: any = {}
      Object.keys(serverRest).forEach(key => {
        serverState[key] = action[key]
      })
      return {
        ...state,
        server: { ...state.server, ...serverState }
      }
    case UPDATE_SETTINGS:
      return { ...state, settings: { ...action.settings } }
    case CLEAR_META:
      return { ...initialState }
    default:
      return state
  }
}

export default dbMetaReducer
