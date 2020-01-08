/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import nock from 'nock'

import * as discovery from './discoveryDuck'
import { APP_START, WEB, CLOUD } from 'shared/modules/app/appDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'

describe('discoveryOnStartupEpic', () => {
  let store
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(discovery.discoveryOnStartupEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      connections: {},
      app: {
        env: WEB
      }
    })
  })
  afterEach(() => {
    nock.cleanAll()
    bus.reset()
    store.clearActions()
  })

  test('listens on APP_START and tries to find a bolt host and sets it to default when bolt discovery not found', done => {
    // Given
    const action = { type: APP_START }
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { http: 'http://localhost:7474' })

    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([action, { type: discovery.DONE }])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and tries to find a bolt host and sets it to default when fail on server error', done => {
    // Given
    const action = { type: APP_START }
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(500)

    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([action, { type: discovery.DONE }])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and finds a bolt host and dispatches an action with the found host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'bolt://myhost:7777'
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { bolt: expectedHost })
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedHost }),
        { type: discovery.DONE }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and finds a bolt_direct host and dispatches an action with the found host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'bolt://myhost:7777'
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { bolt_direct: expectedHost })
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedHost }),
        { type: discovery.DONE }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and finds both a bolt_direct and a bold host and dispatches an action with the found bolt_direct host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'bolt://myhost:7777'
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { bolt_direct: expectedHost, bolt: 'very://bad:1337' })
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedHost }),
        { type: discovery.DONE }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('listens on APP_START and finds all of bolt_routing, bolt_direct and a bold host and dispatches an action with the found bolt_routing host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'neo4j://myhost:7777'
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, {
        bolt_routing: expectedHost,
        bolt_direct: 'bolt://myhost:666',
        bolt: 'very://bad:1337'
      })
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedHost }),
        { type: discovery.DONE }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('listens on APP_START and reads bolt URL from location URL and dispatches an action with the found host', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?connectURL=myhost:8888'
    }
    const expectedURL = 'myhost:8888'
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedURL }),
        currentAction
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('listens on APP_START and reads bolt URL from location URL and dispatches an action with the found host, incl protocol', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?connectURL=bolt%2Brouting%3A%2F%2Fmyhost%3A8889'
    }
    const expectedURL = 'bolt+routing://myhost:8889'
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedURL }),
        currentAction
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('listens on APP_START and reads bolt URL with auth info from location URL and dispatches an action with the found host, incl protocol', done => {
    // Given
    const action = {
      type: APP_START,
      url:
        'http://localhost/?connectURL=bolt%2Brouting%3A%2F%2Fneo4j%3Aneo4j%40myhost%3A8889'
    }
    const expectedURL = 'bolt+routing://myhost:8889'
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({
          host: expectedURL,
          username: 'neo4j',
          password: 'neo4j'
        }),
        currentAction
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})

describe('discoveryOnStartupEpic cloud env', () => {
  let store
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(discovery.discoveryOnStartupEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      connections: {},
      app: {
        env: CLOUD
      }
    })
  })
  afterEach(() => {
    nock.cleanAll()
    bus.reset()
    store.clearActions()
  })
  test('listens on APP_START and finds a bolt host and dispatches an action with the found host in cloud env', done => {
    // Given
    const expectedHost = 'bolt://myhost:7777'
    const action = { type: APP_START, env: CLOUD }
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { bolt: expectedHost })
    bus.take(discovery.DONE, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        discovery.updateDiscoveryConnection({ host: expectedHost }),
        { type: discovery.DONE }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})

describe('injectDiscoveryEpic', () => {
  let store
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(discovery.injectDiscoveryEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      connections: {}
    })
  })
  afterEach(() => {
    nock.cleanAll()
    bus.reset()
    store.clearActions()
  })
  test('injectDiscoveryEpic takes passed properties and updates discovery endpoint', () => {
    // Given
    const action = {
      type: discovery.INJECTED_DISCOVERY,
      username: 'neo4j',
      password: 'test',
      host: 'bolt://localhost:7687',
      encrypted: true
    }

    const p = new Promise((resolve, reject) => {
      bus.take(discovery.DONE, currentAction => {
        // Then
        const actions = store.getActions()
        try {
          expect(actions).toEqual([
            action,
            discovery.updateDiscoveryConnection({
              host: action.host,
              username: action.username,
              password: action.password,
              encrypted: action.encrypted
            }),
            currentAction
          ])
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    // When
    store.dispatch(action)

    // Return
    return p
  })
})
