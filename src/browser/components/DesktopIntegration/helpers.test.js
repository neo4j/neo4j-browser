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
import { getCredentials, getActiveGraph, eventToHandler } from './helpers'

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
    status: 'ACTIVE',
    connection: {
      configuration: {
        host: 'bolt://host',
        port: '7687',
        username: 'username',
        password: 'password',
        encrypted: true
      }
    }
  }
  const apiResponse = {
    projects: [
      {
        graphs: [graph]
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
    expect(getCredentials('xxx', config)).toBeUndefined()
  })
})

test('XXX_YYY -> onXxxYyy', () => {
  // Given
  const tests = [
    { type: undefined, expect: undefined },
    { type: true, expect: undefined },
    { type: 'XXX', expect: 'onXxx' },
    { type: '_XXX', expect: 'onXxx' },
    { type: 'XXX_YYY', expect: 'onXxxYyy' },
    { type: 'XXX_YYY_ZZZ', expect: 'onXxxYyyZzz' },
    { type: 'xxx', expect: 'onXxx' },
    { type: 'xxx_yyy', expect: 'onXxxYyy' },
    { type: 'XXX_123', expect: 'onXxx123' },
    { type: '0', expect: 'on0' },
    { type: '1', expect: 'on1' },
    { type: 1, expect: undefined }
  ]

  // When && Then
  tests.forEach(test => {
    expect(eventToHandler(test.type)).toEqual(test.expect)
  })
})
