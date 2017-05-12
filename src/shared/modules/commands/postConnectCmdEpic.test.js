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

/* global describe, afterEach, test, expect */
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
import { createBus, createReduxMiddleware } from 'suber'
import { UPDATE_SETTINGS } from 'shared/modules/dbMeta/dbMetaDuck'

import * as commands from './commandsDuck'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'

const bus = createBus()
const epicMiddleware = createEpicMiddleware(commands.postConnectCmdEpic)
const mockStore = configureMockStore([epicMiddleware, createReduxMiddleware(bus)])

describe('postConnectCmdEpic', () => {
  afterEach(() => {
    bus.reset()
  })
  test('creates a SYSTEM_COMMAND_QUEUED if found', (done) => {
    // Given
    const command = 'play hello'
    const store = mockStore({
      settings: {
        cmdchar: ':'
      },
      meta: {
        settings: {
          'browser.post_connect_cmd': command
        }
      }
    })
    const action = { type: CONNECTION_SUCCESS }
    const action2 = { type: UPDATE_SETTINGS }
    bus.take('NOOP', (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        action2,
        commands.executeSystemCommand(':' + command),
        { type: 'NOOP' }
      ])
      done()
    })

    // When
    store.dispatch(action)
    store.dispatch(action2)
  })
  test.skip('does nothing if settings not found', (done) => { // Ignore for now. Some bug in mockStore that breaks this test
    // Given
    const store = mockStore({
      settings: {
        cmdchar: ':'
      },
      history: {
        history: [':xxx']
      },
      connections: {},
      params: {}
    })
    const action = { type: CONNECTION_SUCCESS }
    const action2 = { type: UPDATE_SETTINGS }
    bus.take('NOOP', (currentAction) => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        action2,
        { type: 'NOOP' }
      ])
      done()
    })

    // When
    store.dispatch(action)
    store.dispatch(action2)
  })
})
