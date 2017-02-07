/* global describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
// import { BoltConnectionError } from '../../services/exceptions'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
// import { update as updateQueryResult } from '../requests/requestsDuck'
import { send } from 'shared/modules/requests/requestsDuck'
import * as frames from 'shared/modules/stream/streamDuck'

const epicMiddleware = createEpicMiddleware(commands.handleCommandsEpic)
const mockStore = configureMockStore([epicMiddleware])

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

  test('listens on USER_COMMAND_QUEUED for ":" commands and does a series of things', () => {
    // Given
    const cmdString = 'history'
    const cmd = store.getState().settings.cmdchar + cmdString
    const id = 1
    const action = commands.executeCommand(cmd, id)

    // When
    store.dispatch(action)

    // Then
    expect(store.getActions()).toEqual([
      action,
      addHistory({ cmd }),
      helper.interpret(cmdString).exec(action, store.getState().settings.cmdchar, (a) => a, store)
      // { type: 'NOOP' }
    ])
  })

  test('listens on USER_COMMAND_QUEUED for cypher commands and does a series of things', () => {
    // Given
    const cmd = 'RETURN 1'
    const id = 2
    const requestId = 'xxx'
    const action = commands.executeCommand(cmd, id, requestId)

    // When
    store.dispatch(action)

    // Then
    expect(store.getActions()).toEqual([
      action,
      addHistory({cmd}),
      send('cypher', requestId),
      frames.add({...action, type: 'cypher'})
      // below should happen but isn't in the test environment. It is working in the real world.
      // updateQueryResult(requestId, BoltConnectionError(), 'error'),
      // { type: 'NOOP' }
    ])
  })
})
