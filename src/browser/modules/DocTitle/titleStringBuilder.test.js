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

import asTitleString from './titleStringBuilder'

describe('asTitleString', () => {
  test('should return static copy if there is no connectionData', () => {
    // Given
    const connectionData = null

    // When
    const title = asTitleString(connectionData)

    // Then
    expect(title).toBe('Neo4j Browser')
  })
  test('should return static copy if there is connectionData but values are both falsy', () => {
    // Given
    const username = undefined
    const host = null
    const connectionData = { username, host }

    // When
    const title = asTitleString(connectionData)

    // Then
    expect(title).toBe('Neo4j Browser')
  })
  test('should return host + static copy if there is connectionData host', () => {
    // Given
    const username = undefined
    const host = 'foo'
    const connectionData = { username, host }

    // When
    const title = asTitleString(connectionData)

    // Then
    expect(title).toBe(`${host} - Neo4j Browser`)
  })
  test('should return username + static copy if there is connectionData host', () => {
    // Given
    const username = 'foo'
    const host = undefined
    const connectionData = { username, host }

    // When
    const title = asTitleString(connectionData)

    // Then
    expect(title).toBe(`${username} - Neo4j Browser`)
  })
  test('should return string with username and host from connectionData', () => {
    // Given
    const username = 'foo'
    const host = 'bar'
    const connectionData = { username, host }

    // When
    const title = asTitleString(connectionData)

    // Then
    expect(title).toContain(`${username}@${host}`)
  })
})
