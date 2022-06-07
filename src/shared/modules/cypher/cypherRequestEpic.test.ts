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
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import { CYPHER_REQUEST, cypherRequestEpic } from './cypherDuck'
import {
  getUserTxMetadata,
  NEO4J_BROWSER_USER_QUERY,
  userDirectTxMetadata
} from 'services/bolt/txMetadata'

jest.mock('services/bolt/bolt', () => {
  const orig = jest.requireActual('services/bolt/bolt')
  return {
    ...orig,
    directTransaction: jest.fn(() => Promise.resolve({ records: [] }))
  }
})
const bolt = jest.requireMock('services/bolt/bolt')

jest.mock('shared/modules/dbMeta/dbMetaDuck')
const dbMeta = jest.requireMock('shared/modules/dbMeta/dbMetaDuck')

describe('cypherRequestEpic', () => {
  let store: any
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(cypherRequestEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      settings: {}
    })
  })
  afterEach(() => {
    bus.reset()
    store.clearActions()
  })

  test('cypherRequestEpic passes along tx metadata if a queryType exists on action', () => {
    // Given
    dbMeta.getRawVersion.mockImplementation(() => '5.0.0') // has tx support
    const action = {
      type: CYPHER_REQUEST,
      query: 'RETURN 1',
      queryType: NEO4J_BROWSER_USER_QUERY,
      $$responseChannel: 'test-1'
    }

    const p = new Promise<void>((resolve, reject) => {
      bus.take(action.$$responseChannel, () => {
        // Then
        try {
          expect(bolt.directTransaction).toHaveBeenCalledTimes(1)
          expect(bolt.directTransaction).toHaveBeenCalledWith(
            action.query,
            undefined,
            userDirectTxMetadata
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
    dbMeta.getRawVersion.mockImplementation(() => '5.0.0') // Has tx metadata support

    // No queryType = no tx metadata
    const action = {
      type: CYPHER_REQUEST,
      query: 'RETURN 1',
      $$responseChannel: 'test-1'
    }

    const p = new Promise<void>((resolve, reject) => {
      bus.take(action.$$responseChannel, () => {
        // Then
        try {
          expect(bolt.directTransaction).toHaveBeenCalledTimes(1)
          expect(bolt.directTransaction).toHaveBeenCalledWith(
            action.query,
            undefined,
            getUserTxMetadata()
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
