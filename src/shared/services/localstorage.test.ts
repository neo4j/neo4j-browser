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

import * as ls from './localstorage'

describe('localstorage', () => {
  test('getItem return items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      getItem: (key: string) => {
        expect(key).toEqual(ls.keyPrefix + givenKey)
        return JSON.stringify(givenVal)
      }
    } as Storage
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
    } as Storage
    ls.setStorage(storage)

    // When
    const response = ls.setItem(givenKey, givenVal)

    // Then
    expect(response).toBeTruthy()
  })

  test('should fetch items from storage based on key input', () => {
    // Given
    const keys: any[] = ['key1', 'key2', 'key3']
    const vals = {
      key1: 'hello',
      key2: [1, 2, 3]
    }
    const storage = {
      getItem: key => {
        return JSON.stringify(
          vals[key.substring(ls.keyPrefix.length) as 'key1' | 'key2']
        )
      }
    } as Storage
    ls.applyKeys(...keys)
    ls.setStorage(storage)

    // When
    const response = ls.getAll()

    // Then
    expect(response).toEqual(vals)
  })

  it('returns "settings" with the playImplicitInitCommands flag set true', () => {
    ls.applyKeys('settings')
    ls.setStorage(({
      getItem: () => JSON.stringify({})
    } as Partial<Storage>) as Storage)

    expect(ls.getAll()).toEqual(
      expect.objectContaining({
        settings: { playImplicitInitCommands: true }
      })
    )
  })

  describe('localstorage redux middleware', () => {
    const createAndInvokeMiddlewareWithRetainFlag = (retain: boolean) => {
      const setItemMock = jest.fn()
      ls.applyKeys('connections')
      ls.setStorage(({
        setItem: setItemMock
      } as Partial<Storage>) as Storage)

      const state = {
        connections: {
          connectionsById: { $$discovery: { password: 'secret password' } }
        },
        meta: {
          settings: {
            'browser.retain_connection_credentials': retain
          }
        }
      }

      const store = {
        getState: () => state,
        dispatch: jest.fn()
      }
      const next = jest.fn(action => action)
      const action = { type: 'some action' }

      ls.createReduxMiddleware()(store)(next)(action)

      return setItemMock
    }

    it('removes passwords from connection data if browser.retain_connection_credentials is false', () => {
      const setItemMock = createAndInvokeMiddlewareWithRetainFlag(false)

      expect(setItemMock).toHaveBeenCalledWith(
        'neo4j.connections',
        JSON.stringify({
          connectionsById: { $$discovery: { password: '' } }
        })
      )
    })

    it('retains passwords in connection data if browser.retain_connection_credentials is true', () => {
      const setItemMock = createAndInvokeMiddlewareWithRetainFlag(true)

      expect(setItemMock).toHaveBeenCalledWith(
        'neo4j.connections',
        JSON.stringify({
          connectionsById: { $$discovery: { password: 'secret password' } }
        })
      )
    })
  })
})
