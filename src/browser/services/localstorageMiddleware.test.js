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
  makeConnectionsInitialState,
  makeConnectionsPersistedState
} from './localstorageMiddleware'

const connection = {
  reducer: (initialState, action) => {
    return {}
  }
}

describe('localstorageMiddleware', () => {
  test('makeConnectionsPersistedState should set activeConnection to offline', () => {
    // Given
    const before = {
      activeConnection: 'anything'
    }
    const key = 'connections'

    // When
    const after = makeConnectionsPersistedState()(key, before)

    // Then
    expect(after.activeConnection).toEqual('offline')
  })

  test('makeConnectionsInitialState should add offline connection', () => {
    // Given
    const before = {
      activeConnection: 'anything',
      allConnectionIds: ['x'],
      connectionsById: { x: { name: 'x' } }
    }
    const key = 'connections'

    // When
    const after = makeConnectionsInitialState(connection.reducer)(key, before)

    // Then
    expect(after.activeConnection).toEqual('offline')
    expect(after.connectionsById.offline).not.toBeUndefined()
    expect(after.connectionsById.offline.name).toEqual('Offline')
    expect(after.connectionsById.x).not.toBeUndefined()
  })
})
