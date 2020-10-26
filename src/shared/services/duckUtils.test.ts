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

import { hydrate, dehydrate } from './duckUtils'

describe('hydrate', () => {
  test('should merge initialState with state when hydrated is undefined', () => {
    // Given
    const initialState = { foo: 0 }
    const state = { bar: 1 }

    // When
    const newState = hydrate(initialState, state)

    // Then
    expect(newState.foo).toEqual(0)
    expect(newState.bar).toEqual(1)
    expect(newState.hydrated).toEqual(true)
  })
  test('should not merge initialState with state when hydrated is true', () => {
    // Given
    const initialState = { foo: 0 }
    const state = { bar: 1, hydrated: true }

    // When
    const newState = hydrate(initialState, state)

    // Then
    expect(newState.foo).toEqual(undefined)
    expect(newState.bar).toEqual(1)
    expect(newState.hydrated).toEqual(true)
  })
})
describe('dehydrate', () => {
  test('should remove hydrated key from state', () => {
    // Given
    const state = { bar: 1, hydrated: true }

    // When
    const newState = dehydrate(state)

    // Then
    expect(newState.hydrated).toEqual(undefined)
  })
})
