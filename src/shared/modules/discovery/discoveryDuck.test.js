/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

/* global describe, afterEach, test, expect, beforeAll */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'
import nock from 'nock'

import * as discovery from './discoveryDuck'
import { APP_START } from 'shared/modules/app/appDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'

const bus = createBus()
const epicMiddleware = createEpicMiddleware(discovery.discoveryOnStartupEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware(bus)])

describe('discoveryOnStartupEpic', () => {
  let store
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
    nock(getDiscoveryEndpoint()).get('/').reply(200, { http: 'http://localhost:7474' })

    bus.take(discovery.DONE, (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
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
    nock(getDiscoveryEndpoint()).get('/').reply(500)

    bus.take(discovery.DONE, (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
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
    nock(getDiscoveryEndpoint()).get('/').reply(200, { bolt: expectedHost })
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
