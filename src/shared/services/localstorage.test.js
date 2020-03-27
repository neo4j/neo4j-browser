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

import * as ls from './localstorage'

describe('localstorage', () => {
  test('getItem return items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      getItem: key => {
        expect(key).toEqual(ls.keyPrefix + givenKey)
        return JSON.stringify(givenVal)
      }
    }
    ls.setStorage(storage)

    // When
    const response = ls.getItem(givenKey)

    // Then
    expect(response).toEqual(givenVal)
  })

  test('setItem sets items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      setItem: (key, val) => {
        expect(key).toEqual(ls.keyPrefix + givenKey)
        expect(val).toEqual(JSON.stringify(givenVal))
      }
    }
    ls.setStorage(storage)

    // When
    const response = ls.setItem(givenKey, givenVal)

    // Then
    expect(response).toBeTruthy()
  })

  test('should fetch items from storage based on key input', () => {
    // Given
    const keys = ['key1', 'key2', 'key3']
    const vals = {
      key1: 'hello',
      key2: [1, 2, 3]
    }
    const storage = {
      getItem: key => {
        return JSON.stringify(vals[key.substring(ls.keyPrefix.length)])
      }
    }
    ls.applyKeys(...keys)
    ls.setStorage(storage)

    // When
    const response = ls.getAll()

    // Then
    expect(response).toEqual(vals)
  })

  it('returns "settings" with the playImplicitInitCommands flag set true', () => {
    ls.applyKeys('settings')
    ls.setStorage({
      getItem: () => JSON.stringify({})
    })

    expect(ls.getAll()).toEqual(
      expect.objectContaining({
        settings: { playImplicitInitCommands: true }
      })
    )
  })
})
