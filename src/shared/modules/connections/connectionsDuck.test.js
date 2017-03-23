/* global jest, describe, beforeAll, afterEach, test, expect */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import bolt from 'services/bolt/bolt'
jest.mock('services/bolt/bolt', () => {
  return {
    closeActiveConnection: jest.fn()
  }
})
import reducer, * as connections from './connectionsDuck'

const bus = createBus()
const epicMiddleware = createEpicMiddleware(connections.disconnectEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware(bus)])

describe('connections reducer', () => {
  test('handles connections.ADD', () => {
    const action = {
      type: connections.ADD,
      connection: {
        id: 'x',
        name: 'bm'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.allConnectionIds).toEqual(['x'])
    expect(nextState.connectionsById).toEqual({'x': {
      id: 'x',
      name: 'bm'
    }})
  })

  test('handles connections.SET_ACTIVE', () => {
    const initialState = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: connections.SET_ACTIVE,
      connectionId: 2
    }
    const nextState = reducer(initialState, action)
    expect(nextState.activeConnection).toEqual(2)
  })

  test('handles connections.REMOVE', () => {
    const initialState = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: connections.REMOVE,
      connectionId: 2
    }
    const nextState = reducer(initialState, action)
    expect(nextState.allConnectionIds).toEqual([1, 3])
    expect(Object.keys(nextState.connectionsById)).toEqual(['1', '3'])
  })

  test('handles connections.MERGE (update connection)', () => {
    const initialState = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: connections.MERGE,
      connection: {
        id: 1,
        name: 'bm1',
        username: 'new user',
        password: 'different password'
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState.allConnectionIds).toEqual([1, 2, 3])
    expect(nextState.connectionsById['1']).toEqual({id: 1, name: 'bm1', username: 'new user', password: 'different password'})
  })

  test('handles connections.MERGE (add connection)', () => {
    const action = {
      type: connections.MERGE,
      connection: {
        id: 'x',
        name: 'bm'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.allConnectionIds).toEqual(['x'])
    expect(nextState.connectionsById).toEqual({'x': {
      id: 'x',
      name: 'bm'
    }})
  })
})

describe('connectionsDucks Epics', () => {
  let store
  beforeAll(() => {
    store = mockStore({
      connections: {
        activeConnection: null
      }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  test('disconnectEpic', (done) => {
    // Given
    const id = 'xxx'
    const action = connections.disconnectAction(id)

    // When
    epicMiddleware.replaceEpic(connections.disconnectEpic)
    store.dispatch(connections.setActiveConnection(id)) // set an active connection
    store.clearActions()
    bus.take(connections.SET_ACTIVE, (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        connections.updateConnection({ id, password: '' }),
        connections.setActiveConnection(null)
      ])
      done()
    })
    store.dispatch(action)
  })
  test('detectActiveConnectionChangeEpic', (done) => {
    // Given
    const action = connections.setActiveConnection(null)
    bus.take(connections.DISCONNECTION_SUCCESS, (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        currentAction
      ])
      expect(bolt.closeActiveConnection).toHaveBeenCalledTimes(1)
      done()
    })

    // When
    epicMiddleware.replaceEpic(connections.detectActiveConnectionChangeEpic)
    store.dispatch(connections.setActiveConnection('xxx')) // set an active connection
    store.clearActions()

    store.dispatch(action)
  })
})
