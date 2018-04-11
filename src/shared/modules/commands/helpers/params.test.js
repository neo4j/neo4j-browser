/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

/* global jest, describe, test, expect */

import * as params from './params'
import { update, replace } from 'shared/modules/params/paramsDuck'

let mockRoutedWriteTransaction = jest.fn()
jest.mock('services/bolt/bolt', () => ({
  routedWriteTransaction: mockRoutedWriteTransaction
}))
describe('commandsDuck params helper', () => {
  test('fails on :param x x x and shows error hint', () => {
    // Given
    const action = { cmd: ':param x x x: 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return expect(p)
      .rejects.toEqual(
        new Error(
          'Could not parse input. Usage: `:param "x": 2`. SyntaxError: Expected ":" but "x" found.'
        )
      )
      .then(() => expect(mockRoutedWriteTransaction).toHaveBeenCalled())
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
  test('handles :param "x y": 2 and calls the update action creator', () => {
    // Given
    const action = { cmd: ':param "x y": 2' }
    const cmdchar = ':'
    const put = jest.fn()

    // When
    const p = params.handleParamsCommand(action, cmdchar, put)

    // Then
    return p.then(res => {
      expect(res.result).toEqual({ 'x y': 2 })
      expect(put).toHaveBeenCalledWith(update({ 'x y': 2 }))
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
})
