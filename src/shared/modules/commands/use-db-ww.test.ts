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
import { createEpicMiddleware } from 'redux-observable'
import { createBus } from 'suber'

import { executeSingleCommand, handleSingleCommandEpic } from './commandsDuck'
import bolt from 'services/bolt/bolt'
import { flushPromises } from 'services/utils'

jest.mock('services/bolt/setup-bolt-worker', () => {
  const orig = jest.requireActual('services/bolt/setup-bolt-worker')
  return {
    ...orig,
    setupBoltWorker: jest.fn(() => Promise.resolve({ records: [] }))
  }
})
const setupWorkerModule = jest.requireMock('services/bolt/setup-bolt-worker')

jest.mock('shared/modules/params/paramsDuck', () => {
  const orig = jest.requireActual('shared/modules/params/paramsDuck')
  return {
    ...orig,
    getParams: () => ({})
  }
})

jest.mock('shared/modules/dbMeta/dbMetaDuck', () => {
  const orig = jest.requireActual('shared/modules/dbMeta/dbMetaDuck')
  return {
    ...orig,
    getRawVersion: () => '4.0.0'
  }
})

describe('Specified target database, using web workers', () => {
  beforeAll(() => {
    // Fake window worker object
    ;(window as any).Worker = true
    bolt.useDb('autoDb') // Fake setting the db
  })
  test('it uses the db in store if no specific db specified with the action', done => {
    // Given
    setupWorkerModule.setupBoltWorker.mockClear()
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel'
    const action: any = executeSingleCommand(`RETURN 1`)
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(setupWorkerModule.setupBoltWorker).toHaveBeenCalledTimes(1)
      expect(setupWorkerModule.setupBoltWorker).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          connectionProperties: expect.objectContaining({ useDb: 'autoDb' })
        }),
        expect.anything()
      )

      done()
    })
  })
  test('it uses the specified db if passed in with the action', done => {
    // Given
    setupWorkerModule.setupBoltWorker.mockClear()
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel'
    const action: any = executeSingleCommand(`RETURN 1`, { useDb: 'manualDb' }) // <-- specify db
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(setupWorkerModule.setupBoltWorker).toHaveBeenCalledTimes(1)
      expect(setupWorkerModule.setupBoltWorker).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          connectionProperties: expect.objectContaining({ useDb: 'manualDb' })
        }),
        expect.anything()
      )

      done()
    })
  })
})
