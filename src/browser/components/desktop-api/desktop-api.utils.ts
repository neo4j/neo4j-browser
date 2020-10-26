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
 *
 */

import { NATIVE, KERBEROS } from 'services/bolt/boltHelpers'

const notEmpty = str => str.length > 0
const splitOnUnderscore = str => str.split('_')
const toLower = str => str.toLowerCase()
const upperFirst = str => str[0].toUpperCase() + str.substring(1)

// XXX_YYY -> onXxxYyy
export const eventToHandler = type => {
  if (typeof type !== 'string') return null
  return `on${splitOnUnderscore(type)
    .filter(notEmpty)
    .map(toLower)
    .map(upperFirst)
    .join('')}`
}

export const getActiveGraph = (context = {}) => {
  if (!context) return null
  const { projects } = context
  if (!Array.isArray(projects)) return null
  const activeProject = projects.find(project => {
    if (!project) return false
    if (!(project.graphs && Array.isArray(project.graphs))) return false
    return project.graphs.find(({ status }) => status === 'ACTIVE')
  })
  if (!activeProject) return null
  return activeProject.graphs.find(({ status }) => status === 'ACTIVE')
}

const getCredentialsForGraph = (protocol, graph = null) => {
  if (!graph || !graph.connection) return null
  const { configuration = null } = graph.connection
  if (!configuration) {
    return null
  }
  if (!configuration.protocols) {
    return null
  }
  if (typeof configuration.protocols[protocol] === 'undefined') {
    return null
  }
  return configuration.protocols[protocol]
}

export async function createConnectionCredentialsObject(
  activeGraph,
  existingData,
  getKerberosTicket = () => {}
) {
  const creds = getCredentialsForGraph('bolt', activeGraph)
  if (!creds) return // No connection. Ignore and let browser show connection lost msgs.
  const httpsCreds = getCredentialsForGraph('https', activeGraph)
  const httpCreds = getCredentialsForGraph('http', activeGraph)
  const kerberos = isKerberosEnabled(activeGraph)
  if (kerberos !== false) {
    creds.password = await getKerberosTicket(kerberos.servicePrincipal)
  }
  const restApi =
    httpsCreds && httpsCreds.enabled
      ? `https://${httpsCreds.host}:${httpsCreds.port}`
      : `http://${httpCreds.host}:${httpCreds.port}`
  const connectionCreds = {
    // Use current connections creds until we get new from API
    ...existingData,
    ...creds,
    encrypted: creds.tlsLevel === 'REQUIRED',
    host: creds.url || `bolt://${creds.host}:${creds.port}`,
    restApi,
    authenticationMethod: kerberos ? KERBEROS : NATIVE
  }
  return connectionCreds
}

const isKerberosEnabled = activeGraph => {
  if (!activeGraph || typeof activeGraph.connection === 'undefined') {
    return false
  }
  if (!activeGraph.connection) return null
  const { configuration = null } = activeGraph.connection
  if (!configuration) {
    return false
  }
  if (
    !configuration.authenticationMethods ||
    !configuration.authenticationMethods.kerberos
  ) {
    return false
  }
  if (!configuration.authenticationMethods.kerberos.enabled) {
    return false
  }
  return configuration.authenticationMethods.kerberos
}
