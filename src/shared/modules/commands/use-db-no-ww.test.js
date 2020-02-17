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

import { createEpicMiddleware } from 'redux-observable'
import { createBus } from 'suber'
import { flushPromises } from 'services/utils'
import { executeSingleCommand, handleSingleCommandEpic } from './commandsDuck'
import bolt from 'services/bolt/bolt'

jest.mock('services/bolt/boltConnection', () => {
  const orig = require.requireActual('services/bolt/boltConnection')
  return {
    ...orig,
    routedWriteTransaction: jest.fn(() => [
      'id',
      Promise.resolve({ records: [] })
    ])
  }
})
const boltConnection = require.requireMock('services/bolt/boltConnection')

jest.mock('shared/modules/settings/settingsDuck', () => {
  const orig = require.requireActual('shared/modules/settings/settingsDuck')
  return {
    ...orig,
    getCmdChar: () => ':',
    shouldUseCypherThread: () => false
  }
})
const settingsDuck = require.requireMock('shared/modules/settings/settingsDuck')

jest.mock('shared/modules/params/paramsDuck', () => {
  const orig = require.requireActual('shared/modules/params/paramsDuck')
  return {
    ...orig,
    getParams: () => ({})
  }
})

jest.mock('shared/modules/dbMeta/dbMetaDuck', () => {
  const orig = require.requireActual('shared/modules/dbMeta/dbMetaDuck')
  return {
    ...orig,
    getVersion: () => '4.0.0'
  }
})

describe('Specified target database', () => {
  test('it uses the db in store if no specific db specified with the action', done => {
    // Given
    bolt.useDb('autoDb') // Fake setting the db
    boltConnection.routedWriteTransaction.mockClear()

    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel'
    const action = executeSingleCommand(`RETURN 1`)
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(boltConnection.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(boltConnection.routedWriteTransaction).toHaveBeenCalledWith(
        'RETURN 1',
        {},
        expect.objectContaining({ useDb: 'autoDb' })
      )

      done()
    })
  })
  test('it uses the specified db if passed in with the action', done => {
    // Given
    bolt.useDb('autoDb') // Fake setting the db
    boltConnection.routedWriteTransaction.mockClear()

    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel'
    const action = executeSingleCommand(`RETURN 1`, { useDb: 'manualDb' }) // <-- specify db
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(boltConnection.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(boltConnection.routedWriteTransaction).toHaveBeenCalledWith(
        'RETURN 1',
        {},
        expect.objectContaining({ useDb: 'manualDb' })
      )

      done()
    })
  })
})
