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
import {
  udcStartupEpic,
  incrementEventEpic,
  trackSyncLogoutEpic,
  trackConnectsEpic,
  bootEpic,
  METRICS_EVENT,
  typeToMetricsObject,
  EVENT_APP_STARTED,
  EVENT_BROWSER_SYNC_LOGOUT,
  EVENT_BROWSER_SYNC_LOGIN,
  EVENT_DRIVER_CONNECTED
} from './udcDuck'
import { APP_START } from '../app/appDuck'
import {
  CYPHER,
  CYPHER_SUCCEEDED,
  CYPHER_FAILED
} from '../commands/commandsDuck'
import { AUTHORIZED, CLEAR_SYNC } from '../sync/syncDuck'
import { CONNECTION_SUCCESS } from '../connections/connectionsDuck'

describe('Udc Epics', () => {
  describe('udcStartupEpic', () => {
    const bus = createBus()
    const epicMiddleware = createEpicMiddleware(udcStartupEpic)
    const mockStore = configureMockStore([
      epicMiddleware,
      createReduxMiddleware(bus)
    ])
    const store = mockStore({})
    test('sends metric event when app start happens', done => {
      // Given
      const action = { type: APP_START }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(typeToMetricsObject[EVENT_APP_STARTED])
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
  })
  describe('incrementEventEpic', () => {
    const bus = createBus()
    const epicMiddleware = createEpicMiddleware(incrementEventEpic)
    const mockStore = configureMockStore([
      epicMiddleware,
      createReduxMiddleware(bus)
    ])
    const store = mockStore({})
    afterEach(() => {
      store.clearActions()
      bus.reset()
    })
    test('sends metric event when a cypher query is sent by the user', done => {
      // Given
      const action = { type: CYPHER }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(typeToMetricsObject[CYPHER])
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('sends metric event when a successful cypher query is sent by the user', done => {
      // Given
      const action = { type: CYPHER_SUCCEEDED }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(typeToMetricsObject[CYPHER_SUCCEEDED])
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
    test('sends metric event when a failed cypher query is sent by the user', done => {
      // Given
      const action = { type: CYPHER_FAILED }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(typeToMetricsObject[CYPHER_FAILED])
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
  })
  describe('bootEpic', () => {
    const bus = createBus()
    const epicMiddleware = createEpicMiddleware(bootEpic)
    const mockStore = configureMockStore([
      epicMiddleware,
      createReduxMiddleware(bus)
    ])
    const store = mockStore({})
    afterEach(() => {
      store.clearActions()
      bus.reset()
    })
    test('sends metric event when user signs in to browser sync', done => {
      // Given
      const action = { type: AUTHORIZED }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(typeToMetricsObject[EVENT_BROWSER_SYNC_LOGIN])
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
  })
  describe('trackSyncLogoutEpic', () => {
    const bus = createBus()
    const epicMiddleware = createEpicMiddleware(trackSyncLogoutEpic)
    const mockStore = configureMockStore([
      epicMiddleware,
      createReduxMiddleware(bus)
    ])
    const store = mockStore({})
    afterEach(() => {
      store.clearActions()
      bus.reset()
    })
    test('sends metric event when user signs out of browser sync', done => {
      // Given
      const action = { type: CLEAR_SYNC }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(
            typeToMetricsObject[EVENT_BROWSER_SYNC_LOGOUT]
          )
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
  })
  describe('trackConnectsEpic', () => {
    const bus = createBus()
    const epicMiddleware = createEpicMiddleware(trackConnectsEpic)
    const mockStore = configureMockStore([
      epicMiddleware,
      createReduxMiddleware(bus)
    ])
    const store = mockStore({})
    afterEach(() => {
      store.clearActions()
      bus.reset()
    })
    test('sends metric event when user successfully connects to a dbms', done => {
      // Given
      const action = { type: CONNECTION_SUCCESS }
      bus.take(METRICS_EVENT, currentAction => {
        // Then
        expect(currentAction).toEqual(
          expect.objectContaining(typeToMetricsObject[EVENT_DRIVER_CONNECTED])
        )
        expect(store.getActions()).toEqual([action, currentAction])
        done()
      })
      // When
      store.dispatch(action)

      // Then
      // See above
    })
  })
})
