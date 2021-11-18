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

import { isValidUrl, parseHttpVerbCommand } from './http'

describe('isValidUrl', () => {
  it('finishes within a second when called with "EnableMultiStatement:true"', () => {
    const start = Date.now()
    const result = isValidUrl('EnableMultiStatement:true')
    const end = Date.now()

    expect(result).toBe(false)
    expect(end - start).toBeLessThan(1000)
  })
})

describe('HTTP verbs command', () => {
  test('Fails with error on wrong command', done => {
    // Given
    const input = 'xxx '

    // When
    const p = parseHttpVerbCommand(input)

    // Then
    p.then(() => {
      expect(1).toBe(2)
      done()
    }).catch(e => {
      expect(e.message).toEqual('Unparseable http request')
      done()
    })
  })
  test('Fails without url', done => {
    // Given
    const input = 'get '

    // When
    const p = parseHttpVerbCommand(input)

    // Then
    p.then(() => {
      expect(1).toBe(2)
      done()
    }).catch(e => {
      expect(e.message).toEqual('Missing path')
      done()
    })
  })
  test('Fails with non JSON data for post/put', done => {
    // Given
    const input = 'post /test my-data'

    // When
    const p = parseHttpVerbCommand(input)

    // Then
    p.then(() => {
      expect(1).toBe(2)
      done()
    }).catch(e => {
      expect(e.message).toEqual('Payload does not seem to be valid (JSON) data')
      done()
    })
  })
  test('Passes post/put without data', done => {
    // Given
    const input = 'post /test'

    // When
    const p = parseHttpVerbCommand(input)

    // Then
    p.then((r: any) => {
      expect(r.method).toBe('post')
      done()
    }).catch(() => {
      expect(1).toEqual(2)
      done()
    })
  })
  test('Passes post/put with JSON data', done => {
    // Given
    const data = '{"x": 1}'
    const input = `post /test ${data}`

    // When
    const p = parseHttpVerbCommand(input)

    // Then
    p.then((r: any) => {
      expect(r.method).toBe('post')
      expect(r.data).toEqual(data)
      done()
    }).catch(() => {
      expect(1).toEqual(2)
      done()
    })
  })
})
