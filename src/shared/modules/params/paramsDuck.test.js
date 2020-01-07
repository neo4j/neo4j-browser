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

import reducer, * as params from './paramsDuck'
import { dehydrate } from 'services/duckUtils'

describe('paramsDuck', () => {
  test('Finds the reducer', () => {
    expect(reducer).not.toEqual({})
  })

  test('Can add a param to empty state', () => {
    // Given
    const state = {}
    const param = { x: 1 }
    const action = params.update(param)

    // When
    const next = reducer(state, action)

    // Then
    expect(dehydrate(next)).toEqual(param)
  })

  test('Can add a param to non-empty state', () => {
    // Given
    const state = { y: 2 }
    const param = { x: 1 }
    const expected = { ...state, ...param }
    const action = params.update(param)

    // When
    const next = reducer(state, action)

    // Then
    expect(dehydrate(next)).toEqual(expected)
  })

  test('Can overwrite a param to non-empty state', () => {
    // Given
    const state = { y: 2 }
    const param = { y: 1 }
    const action = params.update(param)

    // When
    const next = reducer(state, action)

    // Then
    expect(dehydrate(next)).toEqual(param)
  })
})
