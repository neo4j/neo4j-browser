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

import { Database } from './types'
import { NAME, initialState } from './constants'
import { versionHasEditorHistorySetting } from './dbMeta.utils'
import { GlobalState } from 'shared/globalState'
import { isConfigValFalsy } from 'services/bolt/boltHelpers'

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
