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
import { coerce, SemVer } from 'semver'
import { gte } from 'lodash-es'

export const UPDATE_META = 'meta/UPDATE_META'
export const PARSE_META = 'meta/PARSE_META'
export const UPDATE_SERVER = 'meta/UPDATE_SERVER'
export const UPDATE_SETTINGS = 'meta/UPDATE_SETTINGS'
export const CLEAR_META = 'meta/CLEAR'
export const FORCE_FETCH = 'meta/FORCE_FETCH'
export const DB_META_DONE = 'meta/DB_META_DONE'

export const SYSTEM_DB = 'system'
export const VERSION_FOR_EDITOR_HISTORY_SETTING = '4.3.0'
export const VERSION_FOR_CLUSTER_ROLE_IN_SHOW_DB = '4.3.0'

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

export const update = (obj: any) => {
  return {
    type: UPDATE_META,
    ...obj
  }
}

export const updateSettings = (settings: any) => {
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

export type Procedure = {
  name: string
  description: string
  signature: string
}

export const NAME = 'meta'

export type ClientSettings = {
  'browser.allow_outgoing_connections': boolean
  'browser.credential_timeout': number | string // number (seconds) or duration string (support other units)
  'browser.post_connect_cmd': string
  'browser.remote_content_hostname_allowlist': string
  'browser.retain_connection_credentials': boolean
  'browser.retain_editor_history': boolean
  'clients.allow_telemetry': boolean
  'dbms.security.auth_enabled': boolean
  'metrics.namespaces.enabled': boolean
  'metrics.prefix': string
}

/**
 * Initial client settings, used before the actual settings is loaded. Not to be
 * confused with the default values for the setting, since not always the same.
 */
export const initialClientSettings: ClientSettings = {
  'browser.allow_outgoing_connections': false, // default is true, but set to false until settings read
  'browser.credential_timeout': 0,
  'browser.post_connect_cmd': '',
  'browser.remote_content_hostname_allowlist': 'guides.neo4j.com, localhost', // same as ..._whitelist, just an alias
  'browser.retain_connection_credentials': false, // default is true, but set to false until settings read
  'browser.retain_editor_history': false, // default is true, but set to false until settings read
  'clients.allow_telemetry': true, // default is true. Renamed to client.allow_telemetry after 5.0
  'dbms.security.auth_enabled': true, // default is true, but set to false until settings read
  'metrics.namespaces.enabled': false, // default is false, Renamed to server.metrics.namespaces.enabled after 5.0
  'metrics.prefix': 'neo4j' // default is 'neo4j', Renamed to server.metrics.prefix after 5.0
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
  settings: initialClientSettings
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
  getAvailableSettings(state)['browser.allow_outgoing_connections']
export const getClientsAllowTelemetry = (state: GlobalState): boolean =>
  getAvailableSettings(state)['clients.allow_telemetry'] ??
  initialState.settings['clients.allow_telemetry']
export const credentialsTimeout = (state: any) =>
  getAvailableSettings(state)['browser.credential_timeout'] || 0
export const getRemoteContentHostnameAllowlist = (state: GlobalState): string =>
  getAvailableSettings(state)['browser.remote_content_hostname_allowlist']
export const getDefaultRemoteContentHostnameAllowlist = (): string =>
  initialState.settings['browser.remote_content_hostname_allowlist']
export const getRetainConnectionCredentials = (state: any) => {
  const settings = getAvailableSettings(state)
  const conf = settings['browser.retain_connection_credentials']
  if (conf === null || typeof conf === 'undefined') return false
  return !isConfigValFalsy(conf)
}
export const getRetainEditorHistory = (state: any) => {
  const settings = getAvailableSettings(state)
  const conf = settings['browser.retain_editor_history']
  if (conf === null || typeof conf === 'undefined') return false
  return !isConfigValFalsy(conf)
}
export const getMetricsNamespacesEnabled = (state: GlobalState): boolean =>
  getAvailableSettings(state)['metrics.namespaces.enabled']
export const getMetricsPrefix = (state: GlobalState): string =>
  getAvailableSettings(state)['metrics.prefix']

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

export const isOnCausalCluster = (state: GlobalState): boolean => {
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

// Reducers
const dbMetaReducer = (
  state = initialState,
  unalteredAction: any
): typeof initialState => {
  let action = unalteredAction
  if (unalteredAction && unalteredAction.settings) {
    const allowlist =
      unalteredAction.settings['browser.remote_content_hostname_allowlist'] ||
      unalteredAction.settings['browser.remote_content_hostname_whitelist']

    action = allowlist
      ? {
          ...unalteredAction,
          settings: {
            ...unalteredAction.settings,
            ['browser.remote_content_hostname_allowlist']: allowlist
          }
        }
      : unalteredAction
    delete action.settings['browser.remote_content_hostname_whitelist']
  }

  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state, serverConfigDone: false }
    case UPDATE_META:
      const { type, ...rest } = action
      return { ...state, ...rest }
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
