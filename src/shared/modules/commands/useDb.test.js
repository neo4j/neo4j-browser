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
import * as commands from './commandsDuck'
import { useDb } from 'shared/modules/connections/connectionsDuck'
import { fetchMetaData } from '../dbMeta/dbMetaDuck'

const bus = createBus()
const epicMiddleware = createEpicMiddleware(commands.handleSingleCommandEpic)
const mockStore = configureMockStore([
  epicMiddleware,
  createReduxMiddleware(bus)
])

describe(':use', () => {
  let store

  beforeAll(() => {
    store = mockStore({
      settings: {
        cmdchar: ':'
      },
      meta: { databases: [{ name: 'system' }], server: { version: '4.0.0' } }
    })
  })
  afterEach(() => {
    store.clearActions()
    bus.reset()
  })
  test.skip(':use <db-name> is case insensitive', done => {
    // Given
    const dbName = 'System' // uppercase first letter
    const cmd = `${store.getState().settings.cmdchar}use ${dbName}`
    const action = commands.executeSingleCommand(cmd)
    const existingDb = store.getState().meta.databases[0]
    bus.take('NOOP', currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        useDb(existingDb.name),
        fetchMetaData(),
        expect.objectContaining({
          type: 'frames/ADD',
          state: expect.objectContaining({
            cmd
          })
        }),
        { type: 'NOOP' }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})
