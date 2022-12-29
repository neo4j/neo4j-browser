/*
 * Copyright (c) "Neo4j"
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
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import reducer, * as connections from './connectionsDuck'
import bolt from 'services/bolt/bolt'
import {
  CONNECTION_ID,
  DONE as DISCOVERY_DONE,
  updateDiscoveryConnection
} from 'shared/modules/discovery/discoveryDuck'

jest.mock('services/bolt/bolt', () => {
  return {
    closeConnection: jest.fn(),
    openConnection: jest.fn()
  }
})

describe('connections reducer', () => {
  test('handles connections.SET_ACTIVE', () => {
    const initialState: any = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        1: { id: 1, name: 'bm1' },
        2: { id: 2, name: 'bm2' },
        3: { id: 3, name: 'bm3' }
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
    const initialState: any = {
      allConnectionIds: [1],
      connectionsById: {
        1: { id: 1, name: 'bm1' }
      }
    }
    const action = {
      type: connections.REMOVE,
      connectionId: 1
    }
    const nextState = reducer(initialState, action)
    expect(nextState.allConnectionIds).toEqual([])
    expect(Object.keys(nextState.connectionsById)).toEqual([])
  })

  test('handles connections.MERGE (update connection)', () => {
    const initialState: any = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        id: '$$discovery',
        name: 'bm'
      }
    }
    const action = {
      type: connections.MERGE,
      connection: {
        id: '$$discovery',
        username: 'new user',
        password: 'different password'
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState.allConnectionIds).toEqual(['$$discovery'])
    expect(nextState.connectionsById['$$discovery']).toEqual({
      id: '$$discovery',
      username: 'new user',
      password: 'different password'
    })
  })

  test('handles connections.MERGE (add connection)', () => {
    const action = {
      type: connections.MERGE,
      connection: {
        id: '$$discovery',
        name: 'bm'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.allConnectionIds).toEqual(['$$discovery'])
    expect(nextState.connectionsById).toEqual({
      $$discovery: {
        id: '$$discovery',
        name: 'bm'
      }
    })
  })
})

describe('connectionsDucks Epics', () => {
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(connections.disconnectEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  let store: any
  beforeAll(() => {
    store = mockStore({
      connections: {
        activeConnection: null,
        connectionsById: {
          [CONNECTION_ID]: {
            id: CONNECTION_ID,
            host: undefined,
            username: 'neo4j',
            password: 'neo4j'
          }
        },
        allConnectionIds: [CONNECTION_ID]
      },
      settings: {}
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  test('disconnectEpic', done => {
    // Given
    const id = 'xxx'
    const action = connections.disconnectAction(id)

    // When
    epicMiddleware.replaceEpic(connections.disconnectEpic)
    store.dispatch(connections.setActiveConnection(id)) // set an active connection
    store.clearActions()
    bus.take(connections.SET_ACTIVE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        connections.useDb(null),
        connections.updateConnection({ id, password: '' }),
        connections.setActiveConnection(null)
      ])
      done()
    })
    store.dispatch(action)
  })
  test('startupConnectEpic does not try to connect if no connection host', () => {
    // Given
    const action = {
      type: DISCOVERY_DONE
    }
    ;(bolt.openConnection as jest.Mock).mockReturnValueOnce(Promise.resolve())

    const p = new Promise<void>((resolve, reject) => {
      bus.take(connections.STARTUP_CONNECTION_FAILED, currentAction => {
        // Then
        try {
          expect(store.getActions()).toEqual([
            action,
            connections.useDb(null),
            updateDiscoveryConnection({
              SSOProviders: [],
              SSOError: undefined
            }),
            connections.setActiveConnection(null),
            updateDiscoveryConnection({ password: '', SSOError: undefined }),
            currentAction
          ])
          expect(bolt.openConnection).toHaveBeenCalledTimes(0)
          expect(bolt.closeConnection).toHaveBeenCalledTimes(1)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    epicMiddleware.replaceEpic(connections.startupConnectEpic)
    store.clearActions()
    store.dispatch(action)

    // Return
    return p
  })
  test('detectActiveConnectionChangeEpic', done => {
    // Given
    const action = connections.setActiveConnection(null)
    bus.take(connections.DISCONNECTION_SUCCESS, currentAction => {
      // Then
      expect(store.getActions()).toEqual([action, currentAction])
      expect(bolt.closeConnection).toHaveBeenCalledTimes(1)
      done()
    })

    // When
    epicMiddleware.replaceEpic(connections.detectActiveConnectionChangeEpic)
    store.dispatch(connections.setActiveConnection('xxx')) // set an active connection
    store.clearActions()

    store.dispatch(action)
  })
})
describe('startupConnectEpic', () => {
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(connections.startupConnectEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  let store: any
  beforeAll(() => {
    ;(bolt.openConnection as jest.Mock).mockReset()
    store = mockStore({
      settings: {
        connectionTimeout: 30
      },
      connections: {
        activeConnection: null,
        connectionsById: {
          [CONNECTION_ID]: {
            id: CONNECTION_ID,
            host: 'xxx',
            username: 'neo4j',
            password: 'neo4j'
          }
        },
        allConnectionIds: [CONNECTION_ID]
      }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  test('startupConnectEpic does try to connect if connection host exists', () => {
    // Given
    const action = {
      type: DISCOVERY_DONE
    }
    ;(bolt.openConnection as jest.Mock).mockReturnValue(Promise.reject())

    const p = new Promise<void>((resolve, reject) => {
      bus.take(connections.STARTUP_CONNECTION_FAILED, currentAction => {
        // Then
        const actions = store.getActions()
        try {
          expect(actions).toEqual([
            action,
            connections.useDb(null),
            updateDiscoveryConnection({
              SSOProviders: [],
              SSOError: undefined
            }),
            connections.setActiveConnection(null),
            updateDiscoveryConnection({ password: '', SSOError: undefined }),
            currentAction
          ])
          expect(bolt.openConnection).toHaveBeenCalledTimes(1)
          expect(bolt.closeConnection).toHaveBeenCalledTimes(1)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    epicMiddleware.replaceEpic(connections.startupConnectEpic)
    store.clearActions()
    store.dispatch(action)

    // Return
    return p
  })
})
describe('retainCredentialsSettingsEpic', () => {
  // Given
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(
    connections.retainCredentialsSettingsEpic
  )
  const myMockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  let store: any
  beforeAll(() => {
    bus.reset()
    store = myMockStore({
      connections: {
        activeConnection: 'xxx',
        connectionsById: {
          xxx: { id: 'xxx', username: 'usr', password: 'pw' }
        },
        allConnectionIds: ['xxx']
      }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  test('Dispatches an action to remove credentials from localstorage', done => {
    // Given
    const action = connections.setRetainCredentials(false)
    bus.take(connections.MERGE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        connections.updateConnection({
          id: 'xxx',
          username: '',
          password: ''
        })
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})
describe('switchConnectionEpic', () => {
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(connections.switchConnectionEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  let store: any
  beforeAll(() => {
    ;(bolt.openConnection as jest.Mock).mockReset()
    store = mockStore({
      connections: {
        activeConnection: null,
        connectionsById: {
          [CONNECTION_ID]: {
            id: CONNECTION_ID,
            host: 'xxx',
            username: 'neo4j',
            password: 'neo4j'
          }
        },
        allConnectionIds: [CONNECTION_ID]
      }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  test('switchConnectionEpic takes credentials and tries to connect (success)', () => {
    // Given
    const action = {
      type: connections.SWITCH_CONNECTION,
      username: 'neo4j',
      password: 'test',
      host: 'bolt://localhost:7687',
      encrypted: true
    }
    const connectionInfo = { id: CONNECTION_ID, ...action }
    ;(bolt.openConnection as jest.Mock).mockReturnValue(Promise.resolve())

    const p = new Promise<void>((resolve, reject) => {
      bus.take(connections.SWITCH_CONNECTION_SUCCESS, currentAction => {
        // Then
        const actions = store.getActions()
        try {
          expect(actions).toEqual([
            action,
            connections.updateConnectionState(connections.PENDING_STATE),
            connections.updateConnection(connectionInfo),
            connections.setActiveConnection(CONNECTION_ID),
            currentAction
          ])
          expect(bolt.closeConnection).toHaveBeenCalledTimes(2) // Why 2?
          expect(bolt.openConnection).toHaveBeenCalledTimes(1)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    epicMiddleware.replaceEpic(connections.switchConnectionEpic)
    store.clearActions()
    store.dispatch(action)

    // Return
    return p
  })
  test('switchConnectionEpic takes credentials and tries to connect (fail)', () => {
    // Given
    const action = {
      type: connections.SWITCH_CONNECTION,
      username: 'neo4j',
      password: 'test',
      host: 'bolt://localhost:7687',
      encrypted: true
    }
    const connectionInfo = { id: CONNECTION_ID, ...action }
    ;(bolt.openConnection as jest.Mock).mockReturnValue(Promise.reject())

    const p = new Promise<void>((resolve, reject) => {
      bus.take(connections.SWITCH_CONNECTION_FAILED, currentAction => {
        // Then
        const actions = store.getActions()
        try {
          expect(actions).toEqual([
            action,
            connections.updateConnectionState(connections.PENDING_STATE),
            connections.updateConnection(connectionInfo),
            connections.setActiveConnection(null),
            updateDiscoveryConnection({
              username: 'neo4j',
              password: ''
            }),
            currentAction
          ])
          expect(bolt.closeConnection).toHaveBeenCalledTimes(3) // Why 3?
          expect(bolt.openConnection).toHaveBeenCalledTimes(2) // Why 2?
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    epicMiddleware.replaceEpic(connections.switchConnectionEpic)
    store.clearActions()
    store.dispatch(action)

    // Return
    return p
  })
})
