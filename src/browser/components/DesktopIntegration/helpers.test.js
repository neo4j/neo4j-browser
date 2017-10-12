/*
* Copyright (c) 2002-2017 "Neo4j, Inc,"
* Network Engine for Objects in Lund AB [http://neotechnology.com]
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
/* global test, expect */
import {
  getCredentials,
  getActiveGraph,
  eventToHandler,
  didChangeActiveGraph
} from './helpers'

test('getActiveGraph handles non objects and non-active projects', () => {
  // Given
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
  graphs.forEach(graph => {
    expect(getActiveGraph(graph)).toEqual(null)
  })
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

test('getCredentials handles non objects', () => {
  // Given
  const configs = [null, 'string', undefined, [1]]

  // When && Then
  configs.forEach(config => {
    expect(getCredentials('xxx', config)).toBe(null)
  })
})

test('getCredentials finds credentials on expected format', () => {
  // Given

  const config = {
    bolt: {
      username: 'molly',
      password: 'stella'
    },
    http: {
      username: 'oskar',
      password: 'picachu'
    }
  }
  const connection = {
    configuration: { protocols: config }
  }

  // When
  const boltRes = getCredentials('bolt', connection)
  const httpRes = getCredentials('http', connection)
  const notFoundRes = getCredentials('https', connection)

  // Then
  expect(boltRes).toEqual(config.bolt)
  expect(httpRes).toEqual(config.http)
  expect(notFoundRes).toBe(null)
})

test('XXX_YYY -> onXxxYyy', () => {
  // Given
  const tests = [
    { type: undefined, expect: null },
    { type: true, expect: null },
    { type: 'XXX', expect: 'onXxx' },
    { type: '_XXX', expect: 'onXxx' },
    { type: 'XXX_YYY', expect: 'onXxxYyy' },
    { type: 'XXX_YYY_ZZZ', expect: 'onXxxYyyZzz' },
    { type: 'xxx', expect: 'onXxx' },
    { type: 'xxx_yyy', expect: 'onXxxYyy' },
    { type: 'XXX_123', expect: 'onXxx123' },
    { type: '0', expect: 'on0' },
    { type: '1', expect: 'on1' },
    { type: 1, expect: null }
  ]

  // When && Then
  tests.forEach(test => {
    expect(eventToHandler(test.type)).toEqual(test.expect)
  })
})

test('didChangeActiveGraph detects if the active graph changed', () => {
  // Given
  const createApiResponse = graphs => ({
    projects: [{ graphs }]
  })
  const id1Active = createApiResponse([
    { id: 1, status: 'ACTIVE' },
    { id: 2, status: 'INACTIVE' }
  ])
  const id2Active = createApiResponse([
    { id: 1, status: 'INACTIVE' },
    { id: 2, status: 'ACTIVE' }
  ])
  const noActive = createApiResponse([
    { id: 1, status: 'INACTIVE' },
    { id: 2, status: 'INACTIVE' }
  ])

  // When
  const noChange = didChangeActiveGraph(id1Active, id1Active)
  const didChange = didChangeActiveGraph(id1Active, id2Active)
  const didChange2 = didChangeActiveGraph(id1Active, noActive)

  // Then
  expect(noChange).toBe(false)
  expect(didChange).toBe(true)
  expect(didChange2).toBe(true)
})
