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
import nock from 'nock'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'

import * as connections from '../connections/connectionsDuck'
import * as discovery from './discoveryDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import { APP_START, CLOUD, WEB } from 'shared/modules/app/appDuck'

describe('discoveryOnStartupEpic', () => {
  let store: MockStoreEnhanced<unknown, unknown>

  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(discovery.discoveryOnStartupEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      connections: connections.initialState,
      app: {
        env: WEB
      }
    })
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })
  afterEach(() => {
    nock.cleanAll()
    bus.reset()
    store.clearActions()
  })
  afterAll(() => {
    nock.restore()
  })

  test('listens on APP_START and tries to find a bolt host and sets it to default when bolt discovery not found', done => {
    // Given
    const action = { type: APP_START }
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { http: 'http://localhost:7474' })

    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            SSOProviders: [],
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and tries to find a bolt host and sets it to default when fail on server error', done => {
    // Given
    const action = { type: APP_START }
    nock(getDiscoveryEndpoint()).get('/').reply(500)

    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            SSOProviders: [],
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and finds a bolt host and passes on information from the found host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'bolt://myhost:7777'
    nock(getDiscoveryEndpoint()).get('/').reply(200, { bolt: expectedHost })
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and finds a bolt_direct host and passes on information from the found host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'bolt://myhost:7777'
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { bolt_direct: expectedHost })
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and finds both a bolt_direct and a bolt host and passes the found bolt_direct host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'bolt://myhost:7777'
    nock(getDiscoveryEndpoint())
      .get('/')
      .reply(200, { bolt_direct: expectedHost, bolt: 'very://bad:1337' })
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('listens on APP_START and finds all of bolt_routing, bolt_direct and a bolt host and passes info on the found bolt_routing host', done => {
    // Given
    const action = { type: APP_START, env: WEB }
    const expectedHost = 'neo4j://myhost:7777'
    nock(getDiscoveryEndpoint()).get('/').reply(200, {
      bolt_routing: expectedHost,
      bolt_direct: 'bolt://myhost:666',
      bolt: 'very://bad:1337'
    })
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and reads bolt URL from location URL and passes info on the found host', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?connectURL=neo4j://myhost:8888'
    }
    const expectedHost = 'neo4j://myhost:8888'
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            hasForceUrl: true,
            supportsMultiDb: false
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('also reads to dbms param', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?dbms=neo4j://myhost:8888'
    }
    const expectedHost = 'neo4j://myhost:8888'
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false,
            hasForceUrl: true
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('discovers db param', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?dbms=neo4j://myhost:8888&db=test'
    }
    const expectedHost = 'neo4j://myhost:8888'
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            requestedUseDb: 'test',
            hasForceUrl: true,
            supportsMultiDb: true,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: []
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and reads bolt URL from location URL and passes on the found host, incl protocol', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?connectURL=bolt%2Brouting%3A%2F%2Fmyhost%3A8889'
    }
    const expectedHost = 'neo4j://myhost:8889'
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false,
            hasForceUrl: true
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })

  test('listens on APP_START and reads bolt URL with auth info from location URL and passes on the found host, incl protocol', done => {
    // Given
    const action = {
      type: APP_START,
      url: 'http://localhost/?connectURL=bolt%2Brouting%3A%2F%2Fneo4j%3Aneo4j%40myhost%3A8889'
    }
    const expectedHost = 'neo4j://myhost:8889'
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            username: 'neo4j',
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false,
            hasForceUrl: true
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})

describe('discoveryOnStartupEpic cloud env', () => {
  let store: MockStoreEnhanced<unknown, unknown>
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
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })
  afterEach(() => {
    nock.cleanAll()
    bus.reset()
    store.clearActions()
  })
  afterAll(() => {
    nock.restore()
  })

  test('listens on APP_START and finds a bolt host and passes on the found host in cloud env', done => {
    // Given
    const expectedHost = 'neo4j+s://myhost.neo4j.io:7777'
    const action = { type: APP_START, env: CLOUD }
    nock(getDiscoveryEndpoint()).get('/').reply(200, { bolt: expectedHost })
    bus.take(discovery.DONE, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: discovery.DONE,
          discovered: {
            host: expectedHost,
            SSOError: discovery.NO_SSO_PROVIDERS_ERROR_TEXT,
            SSOProviders: [],
            supportsMultiDb: false
          }
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})

describe('injectDiscoveryEpic', () => {
  let store: MockStoreEnhanced<unknown, unknown>
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
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })
  afterEach(() => {
    nock.cleanAll()
    bus.reset()
    store.clearActions()
  })
  afterAll(() => {
    nock.restore()
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

    const p = new Promise<void>((resolve, reject) => {
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
