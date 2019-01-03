/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

/* global jest, describe, afterEach, test, expect */
import { version } from 'project-root/package.json'
import { createEpicMiddleware } from 'redux-observable'
import { createBus } from 'suber'
import { flushPromises } from 'services/utils'
import {
  executeSystemCommand,
  executeSingleCommand,
  handleSingleCommandEpic
} from './commandsDuck'

jest.mock('services/bolt/bolt', () => {
  const orig = require.requireActual('services/bolt/bolt')
  return {
    ...orig,
    routedWriteTransaction: jest.fn(() => [
      'id',
      Promise.resolve({ records: [] })
    ])
  }
})
const bolt = require.requireMock('services/bolt/bolt')

jest.mock('shared/modules/settings/settingsDuck', () => {
  const orig = require.requireActual('shared/modules/settings/settingsDuck')
  return {
    ...orig,
    getCmdChar: () => ':',
    shouldUseCypherThread: () => false
  }
})

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
    getVersion: () => '3.5.0' // support for tx metadata
  }
})

describe('tx metadata with cypher', () => {
  afterEach(() => {
    bolt.routedWriteTransaction.mockReset()
  })

  it('it adds tx metadata for user entered cypher queries', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel'
    const action = executeSingleCommand('RETURN 1', 'id', 'rqid')
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(bolt.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(bolt.routedWriteTransaction).toHaveBeenCalledWith(
        'RETURN 1',
        {},
        expect.objectContaining({
          txMetadata: { app: `neo4j-browser_v${version}`, type: 'user-direct' }
        })
      )
      done()
    })
  })

  it('it adds tx metadata for system cypher queries', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel2'
    const action = executeSystemCommand('RETURN 1')
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(bolt.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(bolt.routedWriteTransaction).toHaveBeenCalledWith(
        'RETURN 1',
        {},
        expect.objectContaining({
          txMetadata: { app: `neo4j-browser_v${version}`, type: 'system' }
        })
      )
      done()
    })
  })
})
