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
 */

import * as helpers from './udcHelpers'

describe('udcHelpers', () => {
  test('shouldTriggerConnectEvent resolves to true if no prior connect', () => {
    // Given
    const state = {}

    // When
    const res = helpers.shouldTriggerConnectEvent(state)

    // Then
    expect(res).toBe(true)
  })
  test('shouldTriggerConnectEvent resolves to true if last connect was yesterday ', () => {
    // Given
    const state = {
      pingTime: Date.now() - 60 * 60 * 24 * 1000 - 1
    }

    // When
    const res = helpers.shouldTriggerConnectEvent(state)

    // Then
    expect(res).toBe(true)
  })
  test('shouldTriggerConnectEvent resolves to false if last connect was today ', () => {
    // Given
    const state = {
      pingTime: Date.now()
    }

    // When
    const res = helpers.shouldTriggerConnectEvent(state)

    // Then
    expect(res).toBe(false)
  })
})
