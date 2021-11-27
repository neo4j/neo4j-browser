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
export const VERSION_FOR_EDITOR_HISTORY_SETTING = '4.3.0'

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
