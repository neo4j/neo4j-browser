/* global describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { getBus, createReduxMiddleware } from 'suber'

import { BoltConnectionError } from '../../services/exceptions'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { update as updateQueryResult } from '../requests/requestsDuck'
import { send } from 'shared/modules/requests/requestsDuck'
import * as frames from 'shared/modules/stream/streamDuck'
import { disconnectAction } from 'shared/modules/connections/connectionsDuck'
import { merge, set } from 'shared/modules/params/paramsDuck'

const epicMiddleware = createEpicMiddleware(commands.handleCommandsEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware()])

describe('commandsDuck', () => {
  let store
  const bus = getBus()
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
          send('cypher', requestId),
          frames.add({...action, type: 'cypher'}),
          updateQueryResult(requestId, BoltConnectionError(), 'error'),
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
    test('does the right thing for list queries', (done) => {
      const cmd = store.getState().settings.cmdchar + 'queries'
      const id = 1
      const action = commands.executeCommand(cmd, id)

      bus.take('NOOP', (currentAction) => {
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd }),
          frames.add({ ...action, type: 'queries', result: "{res : 'QUERIES RESULT'}" }),
            {type: 'NOOP'}
        ])
        done()
      })

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
