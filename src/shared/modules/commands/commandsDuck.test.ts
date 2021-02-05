/*
 * Copyright (c) 2002-2021 "Neo4j,"
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

import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import {
  BoltConnectionError,
  createErrorObject
} from '../../services/exceptions'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { update as updateQueryResult } from '../requests/requestsDuck'
import { send } from 'shared/modules/requests/requestsDuck'
import * as frames from 'shared/modules/stream/streamDuck'
import { disconnectAction } from 'shared/modules/connections/connectionsDuck'
import {
  update as updateParams,
  replace as replaceParams
} from 'shared/modules/params/paramsDuck'
import {
  update as updateSettings,
  replace as replaceSettings
} from 'shared/modules/settings/settingsDuck'
import { cleanCommand, getInterpreter } from 'services/commandUtils'
import bolt from 'services/bolt/bolt'
import { fetchMetaData } from '../dbMeta/dbMetaDuck'

const originalRoutedWriteTransaction = bolt.routedWriteTransaction

const bus = createBus()
const epicMiddleware = createEpicMiddleware(commands.handleSingleCommandEpic)
const mockStore = configureMockStore([
  epicMiddleware,
  createReduxMiddleware(bus)
])

describe('commandsDuck', () => {
  let store: MockStoreEnhanced<unknown, unknown>
  const maxHistory = 20
  beforeEach(() => {
    bolt.routedWriteTransaction = originalRoutedWriteTransaction
  })
  beforeAll(() => {
    store = mockStore({
      settings: {
        maxHistory
      },
      history: [':xxx'],
      connections: {},
      params: {},
      grass: {
        node: {
          color: '#000'
        }
      },
      meta: {},
      requests: {
        xxx: {
          status: 'pending'
        }
      }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  describe('handleSingleCommandEpic', () => {
    test('listens on SINGLE_COMMAND_QUEUED for cypher commands and does a series of things', done => {
      // Given
      const cmd = 'RETURN 1'
      const id = 2
      const requestId = 'xxx'
      const action = commands.executeSingleCommand(cmd, {
        id,
        requestId
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          send('cypher', requestId),
          frames.add({ ...action, type: 'cypher' } as any),
          updateQueryResult(
            requestId,
            createErrorObject(BoltConnectionError),
            'error'
          ),
          commands.unsuccessfulCypher(cmd),
          fetchMetaData(),
          { type: 'NOOP' }
        ])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See snoopOnActions above
    })

    test('emtpy SYSTEM_COMMAND_QUEUED gets ignored', done => {
      // Given
      const cmd = ' '
      const action = commands.executeSystemCommand(cmd)
      bus.take('NOOP', () => {
        // Then
        const actions = store.getActions()
        expect(actions[0]).toEqual(action)
        expect(actions[1]).toEqual({ type: 'NOOP' })
        done()
      })
      // When
      store.dispatch(action)
    })

    test('does the right thing for :param x: 2', done => {
      // Given
      const cmd = ':param'
      const cmdString = `${cmd} x: 2`
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })

      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          updateParams({ x: 2 }),
          frames.add({
            ...action,
            success: true,
            type: 'param',
            params: { x: 2 }
          } as any),
          {
            ...updateQueryResult(
              'id',
              { result: { x: 2 }, type: 'param' },
              'success'
            ),
            id: undefined
          },
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :param x => 2', done => {
      // Given
      const cmd = ':param'
      const cmdString = `${cmd} x => 2`
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bolt.routedWriteTransaction = jest.fn(() =>
        Promise.resolve({
          records: [{ get: (): number => 2 }]
        })
      )

      bus.take('frames/ADD', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          updateParams({ x: 2 }),
          frames.add({
            ...action,
            success: true,
            type: 'param',
            params: { x: 2 }
          } as any)
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :params {x: 2, y: 3}', done => {
      // Given
      const cmd = ':params'
      const cmdString = `${cmd} {x: 2, y: 3}`
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          replaceParams({ x: 2, y: 3 }),
          frames.add({
            ...action,
            success: true,
            type: 'params',
            params: {}
          } as any),
          {
            ...updateQueryResult(
              'id',
              { result: { x: 2, y: 3 }, type: 'params' },
              'success'
            ),
            id: undefined
          },
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :params', done => {
      // Given
      const cmdString = ':params'
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          frames.add({ ...action, type: 'params', params: {} } as any),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :config x: 2', done => {
      // Given
      const cmd = ':config'
      const cmdString = `${cmd} "x": 2`
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          updateSettings({ x: 2 }),
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ maxHistory: 20 }, null, 2)
          } as any),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :config {"x": 2, "y":3}', done => {
      // Given
      const cmd = ':config'
      const cmdString = `${cmd} {"x": 2, "y":3}`
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          replaceSettings({ x: 2, y: 3 }),
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ maxHistory: 20 }, null, 2)
          } as any),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })

    test('does the right thing for :config', done => {
      // Given
      const cmd = ':config'
      const cmdString = cmd
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ maxHistory: 20 }, null, 2)
          } as any),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })

    test('does the right thing for :style', done => {
      // Given
      const cmd = ':style'
      const cmdString = cmd
      const id = 1
      const action = commands.executeSingleCommand(cmdString, {
        id
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          frames.add({
            ...action,
            type: 'style',
            result: { node: { color: '#000' } }
          } as any),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })

    test('does the right thing for list queries', done => {
      const cmd = ':queries'
      const id = 1
      const action = commands.executeSingleCommand(cmd, { id })

      bus.take('NOOP', () => {
        expect(store.getActions()).toEqual([
          action,
          frames.add({
            ...action,
            type: 'queries',
            result: "{res : 'QUERIES RESULT'}"
          } as any),
          { type: 'NOOP' }
        ])
        done()
      })

      store.dispatch(action)
    })
    test('does the right thing for cypher with comments', done => {
      // Given
      const comment = '//COMMENT FOR RETURN'
      const actualCommand = 'RETURN 1'
      const cmd = `${comment}\n${actualCommand}`
      const id = 2
      const requestId = 'xxx'
      const action = commands.executeSingleCommand(cmd, {
        id,
        requestId
      })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          send('cypher', requestId),
          frames.add({ ...action, type: 'cypher' } as any),
          updateQueryResult(
            requestId,
            createErrorObject(BoltConnectionError),
            'error'
          ),
          commands.unsuccessfulCypher(cmd),
          fetchMetaData(),
          { type: 'NOOP' }
        ])
        done()
      })
      // When
      store.dispatch(action)
    })
    test('does the right thing for history command with comments', done => {
      // Given
      const cmdString = 'history'
      const cmd = `:${cmdString}`
      const id = 1
      const action = commands.executeSingleCommand(cmd, { id })

      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          getInterpreter(helper.interpret, action.cmd).exec(
            Object.assign(action, { cmd: cleanCommand(action.cmd) }),
            (a: any) => a,
            store
          ),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)
    })
  })
  describe(':server disconnect', () => {
    test(':server disconnect produces a DISCONNECT action and a action for a "disconnect" frame', done => {
      // Given
      const serverCmd = 'disconnect'
      const cmd = `:server ${serverCmd}`
      const action = commands.executeSingleCommand(cmd, { id: '$$discovery' })
      bus.take('NOOP', () => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          frames.add({ ...action, type: 'disconnect' } as any),
          disconnectAction('$$discovery'),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)
    })
  })
})
