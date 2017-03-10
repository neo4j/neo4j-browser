/* global jest, describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { getBus, createReduxMiddleware } from 'suber'

import * as commands from './commandsDuck'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'

import bolt from 'services/bolt/bolt'
jest.mock('services/bolt/bolt', () => {
  return {
    transaction: jest.fn()
  }
})

const epicMiddleware = createEpicMiddleware(commands.postConnectCmdEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware()])

describe('postConnectCmdEpic', () => {
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
  test('does nothing if server query fails', (done) => {
    // Setup
    bolt.transaction.mockReturnValueOnce(Promise.reject())
    // Given
    const action = { type: CONNECTION_SUCCESS }
    bus.take('NOOP', (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: 'NOOP' }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('does nothing if settings not found', (done) => {
    // Setup
    bolt.transaction.mockReturnValueOnce(Promise.resolve({
      records: [{get: () => ''}]
    }))
    // Given
    const action = { type: CONNECTION_SUCCESS }
    bus.take('NOOP', (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: 'NOOP' }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('creates a SYSTEM_COMMAND_QUEUED if found', (done) => {
    // Setup
    bolt.transaction.mockReturnValueOnce(Promise.resolve({
      records: [{get: (what) => {
        if (what === 'name') return 'XX,Configuration'
        if (what === 'attributes') {
          return {
            'browser.post_connect_cmd': {value: command}
          }
        }
      }}]
    }))

    // Given
    const command = 'play hello'
    const action = { type: CONNECTION_SUCCESS }
    bus.take('NOOP', (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        commands.executeSystemCommand(':' + command),
        { type: 'NOOP' }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})
