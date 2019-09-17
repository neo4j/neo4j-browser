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
import { split } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { setContext } from 'apollo-link-context'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'
import { onError } from 'apollo-link-error'
import { NATIVE, KERBEROS } from 'services/bolt/boltHelpers'
import {
  SWITCH_CONNECTION,
  SWITCH_CONNECTION_FAILED
} from 'shared/modules/connections/connectionsDuck'
import { INJECTED_DISCOVERY } from 'shared/modules/discovery/discoveryDuck'

export const createClient = (apiEndpoint, apiClientId = null) => {
  const apiEndpointUrl = new URL(apiEndpoint)
  const apiEndpointNoScheme = `${apiEndpointUrl.host}${
    apiEndpointUrl.pathname ? apiEndpointUrl.pathname : ''
  }`

  const httpLink = createHttpLink({
    uri: `http://${apiEndpointNoScheme}`
  })

  const wsLink = new WebSocketLink({
    uri: `ws://${apiEndpointNoScheme}`,
    options: {
      reconnect: true,
      connectionParams: {
        ClientId: apiClientId
      }
    }
  })

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        ClientId: apiClientId
      }
    }
  })

  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    authLink.concat(httpLink)
  )

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `Relate API GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      )
    }

    if (networkError) {
      console.log(`Relate API Network error: ${networkError}`)
    }
  })

  const client = new ApolloClient({
    link: errorLink.concat(link),
    cache: new InMemoryCache()
  })

  return client
}

export function getPrefersColorScheme (workspaceData) {
  return (
    ((workspaceData.workspace || workspaceData.onWorkspaceChange).host || {})
      .prefersColorScheme || null
  )
}

const graphStatus = {
  ACTIVE: 'ACTIVE'
}
export function getActiveGraphData (workspaceData) {
  return (
    (workspaceData &&
      workspaceData.workspace &&
      workspaceData.workspace.projects) ||
    []
  ).reduce((activeGraph, project) => {
    if (!project.graphs) {
      return activeGraph
    }
    const active = project.graphs.filter(
      graph => graph.status === graphStatus.ACTIVE
    )
    if (!active || !active.length) {
      return activeGraph
    }
    return active[0]
  }, null)
}

export const getCredentialsForGraph = (protocol, graph) => {
  if (!graph || !graph.connection) {
    return null
  }
  const { principals = null } = graph.connection
  if (!principals) {
    return null
  }
  if (!principals.protocols) {
    return null
  }
  if (typeof principals.protocols[protocol] === 'undefined') {
    return null
  }
  return principals.protocols[protocol]
}

export async function createConnectionCredentialsObject (
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

function isKerberosEnabled (activeGraph) {
  if (!activeGraph || typeof activeGraph.connection === 'undefined') {
    return false
  }
  if (!activeGraph.connection) return null
  const { principals = null } = activeGraph.connection
  if (!principals) {
    return false
  }
  if (
    !principals.authenticationMethods ||
    !principals.authenticationMethods.kerberos
  ) {
    return false
  }
  if (!principals.authenticationMethods.kerberos.enabled) {
    return false
  }
  return principals.authenticationMethods.kerberos
}

export function detectDesktopThemeChanges (
  setEnvironmentTheme,
  prefersColorScheme
) {
  if (prefersColorScheme) {
    setEnvironmentTheme(prefersColorScheme)
  } else {
    setEnvironmentTheme(null)
  }
}

export async function switchConnection (
  activeGraph,
  defaultConnectionData,
  getKerberosTicket,
  bus
) {
  const connectionCreds = await createConnectionCredentialsObject(
    activeGraph,
    defaultConnectionData,
    getKerberosTicket
  )
  bus.send(SWITCH_CONNECTION, connectionCreds)
}
export async function setInitialConnectionData (
  activeGraph,
  defaultConnectionData,
  getKerberosTicket,
  bus
) {
  const connectionsCredentials = await createConnectionCredentialsObject(
    activeGraph,
    defaultConnectionData,
    getKerberosTicket
  )

  // No connection. Probably no graph active.
  if (!connectionsCredentials) {
    bus.send(SWITCH_CONNECTION_FAILED)
    return
  }
  bus.send(INJECTED_DISCOVERY, connectionsCredentials)
}
