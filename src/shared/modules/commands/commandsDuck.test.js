/* global describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { BoltConnectionError } from '../../services/exceptions'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { update as updateQueryResult } from '../requests/requestsDuck'
import { send } from 'shared/modules/requests/requestsDuck'
import * as frames from 'shared/modules/stream/streamDuck'

// Setup a middleware that calls all fn:s in the
// following array on every action. Very primitive and
// more a poc at this stage.
// If Suber gets a "resetMiddlewares" feature, it can be used instead.
let snoopOnActions = []
const snoopMiddleware = (store) => (next) => (action) => {
  const state = next(action)
  snoopOnActions.forEach((fn) => fn(action))
  return state
}

const epicMiddleware = createEpicMiddleware(commands.handleCommandsEpic)
const mockStore = configureMockStore([epicMiddleware, snoopMiddleware])

describe('commandsEpic', () => {
  let store
  beforeAll(() => {
    store = mockStore({
      settings: {
        cmdchar: ':'
      },
      history: {
        history: [':xxx']
      }
    })
  })
  afterEach(() => {
    store.clearActions()
  })

  test('listens on USER_COMMAND_QUEUED for ":" commands and does a series of things', (done) => {
    // Given
    const cmdString = 'history'
    const cmd = store.getState().settings.cmdchar + cmdString
    const id = 1
    const action = commands.executeCommand(cmd, id)
    snoopOnActions = [(currentAction) => {
      if (currentAction.type === 'NOOP') {
        // Then
        expect(store.getActions()).toEqual([
          action,
          addHistory({ cmd }),
          helper.interpret(cmdString).exec(action, store.getState().settings.cmdchar, (a) => a, store),
          { type: 'NOOP' }
        ])
        done()
      }
    }]

    // When
    store.dispatch(action)

    // Then
    // See snoopOnActions above
  })

  test('listens on USER_COMMAND_QUEUED for cypher commands and does a series of things', (done) => {
    // Given
    const cmd = 'RETURN 1'
    const id = 2
    const requestId = 'xxx'
    const action = commands.executeCommand(cmd, id, requestId)
    snoopOnActions = [(currentAction) => {
      if (currentAction.type === 'NOOP') {
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
      }
    }]
    // When
    store.dispatch(action)

    // Then
    // See snoopOnActions above
  })
})
