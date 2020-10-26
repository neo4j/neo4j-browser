/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import {
  getCredentials,
  getActiveGraph,
  eventToHandler,
  didChangeActiveGraph,
  getActiveCredentials,
  createConnectionCredentialsObject
} from './desktop-api.utils'
import { KERBEROS, NATIVE } from 'services/bolt/boltHelpers'

describe('getActiveGraph', () => {
  const graphs = [
    null,
    'string',
    undefined,
    [1],
    { project: null },
    { projects: { x: 1 } },
    { projects: [{ x: 1 }] },
    { projects: [{ graphs: [{ status: 'NOPE' }] }] }
  ]

  // When && Then
  test.each(graphs)('getActiveGraph handles %o as projects', graph => {
    expect(getActiveGraph(graph)).toEqual(null)
  })

  test('getActiveGraph handles expected objects', () => {
    // Given
    const graph = {
      status: 'ACTIVE'
    }
    const graph2 = {
      status: 'INACTIVE'
    }
    const apiResponse = {
      projects: [
        {
          graphs: [graph, graph2]
        }
      ]
    }

    // When
    const activeGraph = getActiveGraph(apiResponse)

    // Then
    expect(activeGraph).toEqual(graph)
  })
})

describe('eventToHandler', () => {
  const tests = [
    [undefined, null],
    [true, null],
    ['XXX', 'onXxx'],
    ['_XXX', 'onXxx'],
    ['XXX_YYY', 'onXxxYyy'],
    ['XXX_YYY_ZZZ', 'onXxxYyyZzz'],
    ['xxx', 'onXxx'],
    ['xxx_yyy', 'onXxxYyy'],
    ['XXX_123', 'onXxx123'],
    ['0', 'on0'],
    ['1', 'on1'],
    [1, null]
  ]

  // When && Then
  test.each(tests)('handles event of type %s', (type, expected) => {
    expect(eventToHandler(type)).toEqual(expected)
  })
})

describe('createConnectionCredentialsObject', () => {
  test('it creates an expected object from context, and adds kerberos ticket as password', async () => {
    // Given
    const kerberosTicket = 'kerberos-ticket-test'
    const activeConnectionData = createApiResponse(
      generateActiveGraph({ enc: 'REQUIRED', kerberos: true })
    )
    const activeGraph = getActiveGraph(activeConnectionData)
    const getKerberosTicket = jest.fn(() => kerberosTicket)
    const connectionData = await createConnectionCredentialsObject(
      activeGraph,
      {},
      getKerberosTicket
    )
    expect(connectionData).toEqual({
      username: 'one',
      password: kerberosTicket,
      url: 'bolt:port',
      tlsLevel: 'REQUIRED',
      encrypted: true,
      host: 'bolt:port',
      restApi: 'http://foo:bar',
      authenticationMethod: KERBEROS
    })
    expect(getKerberosTicket).toHaveBeenCalledTimes(1)
    expect(getKerberosTicket).toHaveBeenCalledWith('https')
  })
  test('it creates an expected object from context, without kerberos', async () => {
    // Given
    const kerberosTicket = 'kerberos-ticket-test'
    const getKerberosTicket = jest.fn(() => kerberosTicket)
    const activeConnectionData = createApiResponse(
      generateActiveGraph({ enc: 'REQUIRED', kerberos: false })
    )
    const activeGraph = getActiveGraph(activeConnectionData)
    const connectionData = await createConnectionCredentialsObject(
      activeGraph,
      {},
      getKerberosTicket
    )
    expect(connectionData).toEqual({
      username: 'one',
      password: 'one1',
      url: 'bolt:port',
      tlsLevel: 'REQUIRED',
      encrypted: true,
      host: 'bolt:port',
      restApi: 'http://foo:bar',
      authenticationMethod: NATIVE
    })
    expect(getKerberosTicket).toHaveBeenCalledTimes(0)
  })
})

const bolt = (enc = 'OPTIONAL') => ({
  username: 'one',
  password: 'one1',
  url: 'bolt:port',
  tlsLevel: enc
})
const http = {
  host: 'foo',
  port: 'bar'
}

const https = {
  host: 'abc',
  port: 'xyz'
}
const createApiResponse = graphs => ({
  projects: [{ graphs }]
})

const generateActiveGraph = (props = { enc: 'OPTIONAL', kerberos: false }) => [
  {
    id: 1,
    status: 'ACTIVE',
    connection: {
      configuration: {
        protocols: { bolt: bolt(props.enc), http, https },
        authenticationMethods: {
          kerberos: {
            enabled: props.kerberos,
            servicePrincipal: 'https'
          }
        }
      }
    }
  }
]
