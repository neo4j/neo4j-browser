/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

/* global describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import { BoltConnectionError, createErrorObject } from '../../services/exceptions'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { update as updateQueryResult } from '../requests/requestsDuck'
import { send } from 'shared/modules/requests/requestsDuck'
import * as frames from 'shared/modules/stream/streamDuck'
import { disconnectAction } from 'shared/modules/connections/connectionsDuck'
import { merge, set } from 'shared/modules/params/paramsDuck'
import { update as updateSettings } from 'shared/modules/settings/settingsDuck'

const bus = createBus()
const epicMiddleware = createEpicMiddleware(commands.handleCommandsEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware(bus)])

describe('commandsDuck', () => {
  let store
  beforeAll(() => {
    store = mockStore({
      settings: {
        cmdchar: ':'
      },
      history: {
        history: [':xxx']
      },
      connections: {},
      params: {}
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  describe('commandsEpic', () => {
    test('listens on USER_COMMAND_QUEUED for ":" commands and does a series of things', (done) => {
      // Given
      const cmdString = 'history'
      const cmd = store.getState().settings.cmdchar + cmdString
      const id = 1
      const action = commands.executeCommand(cmd, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd }),
          { type: commands.KNOWN_COMMAND },
          helper.interpret(cmdString).exec(action, store.getState().settings.cmdchar, (a) => a, store),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)
    })

    test('listens on USER_COMMAND_QUEUED for cypher commands and does a series of things', (done) => {
      // Given
      const cmd = 'RETURN 1'
      const id = 2
      const requestId = 'xxx'
      const action = commands.executeCommand(cmd, id, requestId)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({cmd}),
          { type: commands.KNOWN_COMMAND },
          send('cypher', requestId),
          frames.add({...action, type: 'cypher'}),
          updateQueryResult(requestId, createErrorObject(BoltConnectionError), 'error'),
          { type: 'NOOP' }
        ])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See snoopOnActions above
    })

    test('does the right thing for :param x: 2', (done) => {
      // Given
      const cmd = store.getState().settings.cmdchar + 'param'
      const cmdString = cmd + ' x: 2'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd: cmdString }),
          { type: commands.KNOWN_COMMAND },
          merge({x: 2}),
          frames.add({...action, success: true, type: 'param', params: {x: 2}}),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :params {x: 2, y: 3}', (done) => {
      // Given
      const cmd = store.getState().settings.cmdchar + 'params'
      const cmdString = cmd + ' {x: 2, y: 3}'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd: cmdString }),
          { type: commands.KNOWN_COMMAND },
          set({x: 2, y: 3}),
          frames.add({...action, success: true, type: 'params', params: {}}),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :params', (done) => {
      // Given
      const cmdString = store.getState().settings.cmdchar + 'params'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd: cmdString }),
          { type: commands.KNOWN_COMMAND },
          frames.add({...action, type: 'params', params: {}}),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for :config x: 2', (done) => {
      // Given
      const cmd = store.getState().settings.cmdchar + 'config'
      const cmdString = cmd + ' x: 2'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd: cmdString }),
          { type: commands.KNOWN_COMMAND },
          updateSettings({x: 2}),
          frames.add({...action, type: 'pre', result: JSON.stringify({cmdchar: ':'}, null, 2)}),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('does the right thing for list queries', (done) => {
      const cmd = store.getState().settings.cmdchar + 'queries'
      const id = 1
      const action = commands.executeCommand(cmd, id)

      bus.take('NOOP', (currentAction) => {
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd }),
          { type: commands.KNOWN_COMMAND },
          frames.add({ ...action, type: 'queries', result: "{res : 'QUERIES RESULT'}" }),
          {type: 'NOOP'}
        ])
        done()
      })

      store.dispatch(action)
    })
  })
  describe(':unknown', () => {
    test('unkown commands send out an UNKNOWN_COMMAND acation and not added to history', (done) => {
      // Given
      const cmd = store.getState().settings.cmdchar + 'unknown'
      const id = 1
      const action = commands.executeCommand(cmd, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          commands.unknownCommand(cmd),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)
    })
  })
  describe(':server disconnect', () => {
    test(':server disconnect produces a DISCONNECT action and a action for a "disconnect" frame', (done) => {
      // Given
      const serverCmd = 'disconnect'
      const cmd = store.getState().settings.cmdchar + 'server ' + serverCmd
      const id = 3
      const action = commands.executeCommand(cmd, id)
      bus.take('NOOP', (currentAction) => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({cmd}),
          { type: commands.KNOWN_COMMAND },
          frames.add({...action, type: 'disconnect'}),
          disconnectAction(null),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)
    })
  })
})
