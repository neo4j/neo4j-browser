/* global test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import * as commands from './commandsDuck'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'

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
      helper.interpret(cmdString).exec(action, store.getState().settings.cmdchar, (a) => a, store),
      { type: 'NOOP' }
    ])
  })

  test('listens on USER_COMMAND_QUEUED for cypher commands and does a series of things', () => {
    // Given
    const cmd = 'RETURN 1'
    const id = 2
    const action = commands.executeCommand(cmd, id)

    // When
    store.dispatch(action)

    // Then
    expect(store.getActions()).toEqual([
      action,
      addHistory({ cmd }),
      helper.interpret('cypher').exec(action, null, (a) => a, store),
      { type: 'NOOP' }
    ])
  })
})
