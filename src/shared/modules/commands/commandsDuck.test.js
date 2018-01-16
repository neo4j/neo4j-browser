/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import {
  BoltConnectionError,
  createErrorObject
} from '../../services/exceptions'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
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

const bus = createBus()
const epicMiddleware = createEpicMiddleware(commands.handleCommandsEpic)
const mockStore = configureMockStore([
  epicMiddleware,
  createReduxMiddleware(bus)
])

describe('commandsDuck', () => {
  let store
  const maxHistory = 20
  beforeAll(() => {
    store = mockStore({
      settings: {
        cmdchar: ':',
        maxHistory: maxHistory
      },
      history: [':xxx'],
      connections: {},
      params: {},
      grass: {
        node: {
          color: '#000'
        }
      }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  describe('commandsEpic', () => {
    test('listens on USER_COMMAND_QUEUED for ":" commands and does a series of things', done => {
      // Given
      const cmdString = 'history'
      const cmd = store.getState().settings.cmdchar + cmdString
      const id = 1
      const action = commands.executeCommand(cmd, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmd, maxHistory),
          { type: commands.KNOWN_COMMAND },
          helper
            .interpret(cmdString)
            .exec(action, store.getState().settings.cmdchar, a => a, store),
          { type: 'NOOP' }
        ])
        done()
      })

      // When
      store.dispatch(action)
    })

    test('listens on USER_COMMAND_QUEUED for cypher commands and does a series of things', done => {
      // Given
      const cmd = 'RETURN 1'
      const id = 2
      const requestId = 'xxx'
      const action = commands.executeCommand(cmd, id, requestId)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmd, maxHistory),
          { type: commands.KNOWN_COMMAND },
          send('cypher', requestId),
          commands.cypher(cmd),
          frames.add({ ...action, type: 'cypher' }),
          updateQueryResult(
            requestId,
            createErrorObject(BoltConnectionError),
            'error'
          ),
          commands.unsuccessfulCypher(cmd),
          { type: 'NOOP' }
        ])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See snoopOnActions above
    })

    test('does the right thing for :param x: 2', done => {
      // Given
      const cmd = store.getState().settings.cmdchar + 'param'
      const cmdString = cmd + ' x: 2'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          updateParams({ x: 2 }),
          frames.add({
            ...action,
            success: true,
            type: 'param',
            params: { x: 2 }
          }),
          { type: 'NOOP' }
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
      const cmd = store.getState().settings.cmdchar + 'params'
      const cmdString = cmd + ' {x: 2, y: 3}'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          replaceParams({ x: 2, y: 3 }),
          frames.add({ ...action, success: true, type: 'params', params: {} }),
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
      const cmdString = store.getState().settings.cmdchar + 'params'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          frames.add({ ...action, type: 'params', params: {} }),
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
      const cmd = store.getState().settings.cmdchar + 'config'
      const cmdString = cmd + ' "x": 2'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          updateSettings({ x: 2 }),
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ cmdchar: ':', maxHistory: 20 }, null, 2)
          }),
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
      const cmd = store.getState().settings.cmdchar + 'config'
      const cmdString = cmd + ' {"x": 2, "y":3}'
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          replaceSettings({ x: 2, y: 3 }),
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ cmdchar: ':', maxHistory: 20 }, null, 2)
          }),
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
      const cmd = store.getState().settings.cmdchar + 'config'
      const cmdString = cmd
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ cmdchar: ':', maxHistory: 20 }, null, 2)
          }),
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
      const cmd = store.getState().settings.cmdchar + 'style'
      const cmdString = cmd
      const id = 1
      const action = commands.executeCommand(cmdString, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmdString, maxHistory),
          { type: commands.KNOWN_COMMAND },
          frames.add({
            ...action,
            type: 'pre',
            result: JSON.stringify({ node: { color: '#000' } }, null, 2)
          }),
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
      const cmd = store.getState().settings.cmdchar + 'queries'
      const id = 1
      const action = commands.executeCommand(cmd, id)

      bus.take('NOOP', currentAction => {
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmd, maxHistory),
          { type: commands.KNOWN_COMMAND },
          frames.add({
            ...action,
            type: 'queries',
            result: "{res : 'QUERIES RESULT'}"
          }),
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
      const cmd = comment + '\n' + actualCommand
      const id = 2
      const requestId = 'xxx'
      const action = commands.executeCommand(cmd, id, requestId)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmd, maxHistory),
          { type: commands.KNOWN_COMMAND },
          send('cypher', requestId),
          commands.cypher(cmd),
          frames.add({ ...action, type: 'cypher' }),
          updateQueryResult(
            requestId,
            createErrorObject(BoltConnectionError),
            'error'
          ),
          commands.unsuccessfulCypher(cmd),
          { type: 'NOOP' }
        ])
        done()
      })
      // When
      store.dispatch(action)
    })
    test('does the right thing for history command with comments', done => {
      // Given
      const comment = '//COMMENT FOR HISTORY'
      const cmdString = 'history'
      const cmd = comment + '\n' + store.getState().settings.cmdchar + cmdString
      const id = 1
      const action = commands.executeCommand(cmd, id)
      const cmdChar = store.getState().settings.cmdchar

      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmd, maxHistory),
          { type: commands.KNOWN_COMMAND },
          getInterpreter(helper.interpret, action.cmd, cmdChar).exec(
            Object.assign(action, { cmd: cleanCommand(action.cmd) }),
            cmdChar,
            a => a,
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
  describe(':unknown', () => {
    test('unkown commands send out an UNKNOWN_COMMAND acation and not added to history', done => {
      // Given
      const cmd = store.getState().settings.cmdchar + 'unknown'
      const id = 1
      const action = commands.executeCommand(cmd, id)
      bus.take('NOOP', currentAction => {
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
    test(':server disconnect produces a DISCONNECT action and a action for a "disconnect" frame', done => {
      // Given
      const serverCmd = 'disconnect'
      const cmd = store.getState().settings.cmdchar + 'server ' + serverCmd
      const id = 3
      const action = commands.executeCommand(cmd, id)
      bus.take('NOOP', currentAction => {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory(cmd, maxHistory),
          { type: commands.KNOWN_COMMAND },
          frames.add({ ...action, type: 'disconnect' }),
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
