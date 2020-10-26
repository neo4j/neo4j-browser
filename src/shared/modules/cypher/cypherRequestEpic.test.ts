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

import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import { cypherRequestEpic, CYPHER_REQUEST } from './cypherDuck'
import {
  NEO4J_BROWSER_USER_QUERY,
  getUserDirectTxMetadata
} from 'services/bolt/txMetadata'

jest.mock('services/bolt/bolt', () => {
  const orig = require.requireActual('services/bolt/bolt')
  return {
    ...orig,
    directTransaction: jest.fn(() => Promise.resolve({ records: [] }))
  }
})
const bolt = require.requireMock('services/bolt/bolt')

jest.mock('shared/modules/dbMeta/dbMetaDuck')
const dbMeta = require.requireMock('shared/modules/dbMeta/dbMetaDuck')

describe('cypherRequestEpic', () => {
  let store
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(cypherRequestEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      settings: { useCypherThread: false }
    })
  })
  afterEach(() => {
    bus.reset()
    store.clearActions()
  })

  test('cypherRequestEpic passes along tx metadata if a queryType exists on action', () => {
    // Given
    dbMeta.getVersion.mockImplementation(() => '5.0.0') // has tx support
    const action = {
      type: CYPHER_REQUEST,
      query: 'RETURN 1',
      queryType: NEO4J_BROWSER_USER_QUERY,
      $$responseChannel: 'test-1'
    }

    const p = new Promise((resolve, reject) => {
      bus.take(action.$$responseChannel, () => {
        // Then
        try {
          expect(bolt.directTransaction).toHaveBeenCalledTimes(1)
          expect(bolt.directTransaction).toHaveBeenCalledWith(
            action.query,
            undefined,
            {
              useCypherThread: store.getState().settings.useCypherThread,
              ...getUserDirectTxMetadata({ hasServerSupport: true })
            }
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    store.dispatch(action)

    // Return
    return p
  })
  test('cypherRequestEpic does NOT pass along tx metadata if no server support', () => {
    // Given
    bolt.directTransaction.mockClear()
    dbMeta.getVersion.mockImplementation(() => '1.0.0') // No tx metadata support

    const action = {
      type: CYPHER_REQUEST,
      query: 'RETURN 1',
      queryType: NEO4J_BROWSER_USER_QUERY,
      $$responseChannel: 'test-1'
    }

    const p = new Promise((resolve, reject) => {
      bus.take(action.$$responseChannel, () => {
        // Then
        try {
          expect(bolt.directTransaction).toHaveBeenCalledTimes(1)
          expect(bolt.directTransaction).toHaveBeenCalledWith(
            action.query,
            undefined,
            {
              useCypherThread: store.getState().settings.useCypherThread
            }
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    store.dispatch(action)

    // Return
    return p
  })
  test('cypherRequestEpic handles actions without queryType', () => {
    // Given
    bolt.directTransaction.mockClear()
    dbMeta.getVersion.mockImplementation(() => '5.0.0') // Has tx metadata support

    // No queryType = no tx metadata
    const action = {
      type: CYPHER_REQUEST,
      query: 'RETURN 1',
      $$responseChannel: 'test-1'
    }

    const p = new Promise((resolve, reject) => {
      bus.take(action.$$responseChannel, () => {
        // Then
        try {
          expect(bolt.directTransaction).toHaveBeenCalledTimes(1)
          expect(bolt.directTransaction).toHaveBeenCalledWith(
            action.query,
            undefined,
            {
              useCypherThread: store.getState().settings.useCypherThread
            }
          )
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    store.dispatch(action)

    // Return
    return p
  })
})
