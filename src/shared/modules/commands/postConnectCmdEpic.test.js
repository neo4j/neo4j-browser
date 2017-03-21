/* global jest, describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import * as commands from './commandsDuck'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'

import bolt from 'services/bolt/bolt'
jest.mock('services/bolt/bolt', () => {
  return {
    directTransaction: jest.fn()
  }
})

const bus = createBus()
const epicMiddleware = createEpicMiddleware(commands.postConnectCmdEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware(bus)])

describe('postConnectCmdEpic', () => {
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
  test('does nothing if server query fails', (done) => {
    // Setup
    bolt.directTransaction.mockReturnValueOnce(Promise.reject())
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
    bolt.directTransaction.mockReturnValueOnce(Promise.resolve({
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
    bolt.directTransaction.mockReturnValueOnce(Promise.resolve({
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
