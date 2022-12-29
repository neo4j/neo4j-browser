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

import {
  autoCommitTxCommand,
  executeSingleCommand,
  executeSystemCommand,
  handleSingleCommandEpic
} from './commandsDuck'
import { version } from 'project-root/package.json'
import { flushPromises } from 'services/utils'

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
    getRawVersion: () => '3.5.0' // support for tx metadata
  }
})

describe('tx metadata with cypher', () => {
  afterEach(() => {
    bolt.routedWriteTransaction.mockClear()
  })

  it('it adds tx metadata for user entered cypher queries', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel'
    const action: any = executeSingleCommand('RETURN 1', {
      id: 'id',
      requestId: 'rqid'
    })
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
    const action: any = executeSystemCommand('RETURN 1')
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

describe('Implicit vs explicit transactions', () => {
  afterEach(() => {
    bolt.routedWriteTransaction.mockClear()
  })
  test(`it sends the autoCommit flag = true to tx functions when using the :${autoCommitTxCommand} command`, done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel3'
    const action: any = executeSingleCommand(`:${autoCommitTxCommand} RETURN 1`)
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(bolt.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(bolt.routedWriteTransaction).toHaveBeenCalledWith(
        'RETURN 1',
        {},
        expect.objectContaining({
          autoCommit: true
        })
      )
      done()
    })
  })
  test('Sets autocommit flag = true even with leading comments in cypher', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel3'
    const action: any = executeSingleCommand(
      `// comment
/*
multiline comment
*/
// comment

// comment
/*:auto*/:${autoCommitTxCommand} RETURN ":auto"`
    )
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(bolt.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(bolt.routedWriteTransaction).toHaveBeenCalledWith(
        `// comment
/*
multiline comment
*/
// comment

// comment
/*:auto*/RETURN ":auto"`,
        {},
        expect.objectContaining({
          autoCommit: true
        })
      )
      done()
    })
  })
  test('it sends the autoCommit flag = false to tx functions on regular cypher', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(handleSingleCommandEpic))
    const $$responseChannel = 'test-channel4'
    const action: any = executeSingleCommand('RETURN 1')
    action.$$responseChannel = $$responseChannel

    bus.send(action.type, action)
    flushPromises().then(() => {
      expect(bolt.routedWriteTransaction).toHaveBeenCalledTimes(1)
      expect(bolt.routedWriteTransaction).toHaveBeenCalledWith(
        'RETURN 1',
        {},
        expect.objectContaining({
          autoCommit: false
        })
      )
      done()
    })
  })
})
