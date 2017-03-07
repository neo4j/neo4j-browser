/* global describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { getBus, createReduxMiddleware } from 'suber'
import nock from 'nock'

import * as discovery from './discoveryDuck'
import { APP_START } from 'shared/modules/app/appDuck'

const epicMiddleware = createEpicMiddleware(discovery.discoveryOnStartupEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware()])

describe('discoveryOnStartupEpic', () => {
  let store
  let bus = getBus()
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

  test('listens on APP_START and tries to find a bolt host and sets it to default when bolt discovery not found', (done) => {
    // Given
    const action = { type: APP_START }
    const expectedHost = discovery.DEFAULT_BOLT_HOST
    nock(discovery.DISCOVERY_ENDPOINT).get('/').reply(200, { http: 'http://localhost:7474' })

    bus.take(discovery.DONE, (currentAction) => {
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

  test('listens on APP_START and tries to find a bolt host and sets it to default when fail on server error', (done) => {
    // Given
    const action = { type: APP_START }
    const expectedHost = discovery.DEFAULT_BOLT_HOST
    nock(discovery.DISCOVERY_ENDPOINT).get('/').reply(500)

    bus.take(discovery.DONE, (currentAction) => {
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

  test('listens on APP_START and finds a bolt host and dispatches an action with the found host', (done) => {
    // Given
    const action = { type: APP_START }
    const expectedHost = 'bolt://myhost:7777'
    nock(discovery.DISCOVERY_ENDPOINT).get('/').reply(200, { bolt: expectedHost })

    bus.take(discovery.DONE, (currentAction) => {
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
