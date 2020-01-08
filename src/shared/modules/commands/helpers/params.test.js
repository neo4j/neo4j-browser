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

import * as params from './params'
import { update, replace } from 'shared/modules/params/paramsDuck'

jest.mock('services/bolt/bolt', () => ({
  routedWriteTransaction: jest.fn(() => {
    return Promise.resolve({ records: [{ get: () => 2 }] })
  })
}))

describe('commandsDuck params helper', () => {
  test('fails on :param x x x and shows error hint', () => {
    // Given
    const action = { cmd: ':param x x x: 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    return params
      .handleParamsCommand(action, cmdchar, put)
      .then(() => {
        throw Error('THIS SHOULD NEVER HAPPEN')
      })
      .catch(error => {
        expect(error.message).toMatch('Error: Syntax error at line 1 col 3:')
        expect(put).not.toHaveBeenCalled()
      })
  })
  test('handles :param "x": 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':param "x": 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return p.then(res => {
      expect(res.result).toEqual({ x: 2 })
      expect(put).toHaveBeenCalledWith(update({ x: 2 }))
    })
  })
  test('handles :param x: 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':param x: 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return p.then(res => {
      expect(res.result).toEqual({ x: 2 })
      expect(put).toHaveBeenCalledWith(update({ x: 2 }))
    })
  })
  test('handles :params {"hej": "ho", "let\'s": "go"} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':params {"hej": "ho", "let\'s": "go"}' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return p.then(res => {
      expect(res.result).toEqual({ hej: 'ho', "let's": 'go' })
      expect(put).toHaveBeenCalledWith(replace({ hej: 'ho', "let's": 'go' }))
    })
  })
  test('handles :params {x: 1, y: 2} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':params {x: 1, y: 2}' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return p.then(res => {
      expect(res.result).toEqual({ x: 1, y: 2 })
      expect(put).toHaveBeenCalledWith(replace({ x: 1, y: 2 }))
    })
  })
  test('handles :params {x: 1, y: 2, z: {a: 3}} and calls the replace action creator', () => {
    // Given
    const action = { cmd: ':params {x: 1, y: 2, z: {a: 3}}' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return p.then(res => {
      expect(res.result).toEqual({ x: 1, y: 2, z: { a: 3 } })
      expect(put).toHaveBeenCalledWith(replace({ x: 1, y: 2, z: { a: 3 } }))
    })
  })
  describe('extract key/value from params', () => {
    test('<key>: <value>', () => {
      expect(params.extractParams('foo: bar')).toEqual({
        key: 'foo',
        value: 'bar',
        originalParamValue: 'bar',
        isFn: false
      })
    })
    test('<key with space>: <value>', () => {
      expect(params.extractParams('"f o o": bar')).toEqual({
        key: 'f o o',
        value: 'bar',
        originalParamValue: 'bar',
        isFn: false
      })
    })
  })
})
