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

import neo4j from 'neo4j-driver'

import { versionHasEditorHistorySetting } from './utils'
import { GlobalState } from 'shared/globalState'
import { isConfigValFalsy } from 'services/bolt/boltHelpers'
import {
  UPDATE_META,
  PARSE_META,
  UPDATE_SERVER,
  UPDATE_SETTINGS,
  CLEAR_META
} from './constants'
import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'meta'
// Initial state
export const initialState = {
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
  serverConfigDone: false,
  settings: {
    'browser.allow_outgoing_connections': false,
    'browser.remote_content_hostname_allowlist': 'guides.neo4j.com, localhost',
    'browser.retain_connection_credentials': false,
    'browser.retain_editor_history': false,
    'clients.allow_telemetry': true
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
export function getMetaInContext(state: any, context: any) {
  const inCurrentContext = (e: any) => e.context === context

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

export const getVersion = (state: GlobalState): string | null =>
  (state[NAME] || {}).server ? (state[NAME] || {}).server.version : null
export const getEdition = (state: GlobalState) => state[NAME].server.edition
export const hasEdition = (state: any) =>
  state[NAME].server.edition !== initialState.server.edition
export const getStoreSize = (state: any) => state[NAME].server.storeSize
export const getClusterRole = (state: any) => state[NAME].role
export const isEnterprise = (state: any) =>
  ['enterprise'].includes(state[NAME].server.edition)
export const isBeta = (state: any) => /-/.test(state[NAME].server.version)
export const getStoreId = (state: any) =>
  state[NAME] && state[NAME].server ? state[NAME].server.storeId : null
export const isServerConfigDone = (state: GlobalState): boolean =>
  state[NAME].serverConfigDone

export const getAvailableSettings = (state: any) =>
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

export const getDatabases = (state: any): Database[] =>
  (state[NAME] || initialState).databases
export const getActiveDbName = (state: any) =>
  ((state[NAME] || {}).settings || {})['dbms.active_database']

export const supportsEditorHistorySetting = (state: any) =>
  isEnterprise(state) && versionHasEditorHistorySetting(getVersion(state))

export const shouldAllowOutgoingConnections = (state: any) =>
  (hasEdition(state) && !isEnterprise(state)) ||
  getAllowOutgoingConnections(state)

export const shouldRetainConnectionCredentials = (state: any) =>
  !isEnterprise(state) || getRetainConnectionCredentials(state)

export const shouldRetainEditorHistory = (state: any) =>
  !supportsEditorHistorySetting(state) || getRetainEditorHistory(state)

// Reducers
function updateMetaForContext(state: any, meta: any, context: any) {
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
  const notInCurrentContext = (e: any) => e.context !== context
  const mapResult = (metaIndex: any, mapFunction: any) =>
    meta.records[metaIndex].get(0).data.map(mapFunction)
  const mapSingleValue = (r: any) => ({
    val: r,
    context
  })
  const mapInteger = (r: any) => (neo4j.isInt(r) ? r.toNumber() || 0 : r || 0)
  const mapInvocableValue = (r: any) => {
    const { name, signature, description } = r
    return {
      val: name,
      context,
      signature,
      description
    }
  }

  const compareMetaItems = (a: any, b: any) =>
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
    case PARSE_META:
      return {
        ...state,
        ...updateMetaForContext(state, action.meta, action.context)
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
