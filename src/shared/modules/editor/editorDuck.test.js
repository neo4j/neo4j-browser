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
  populateEditorFromUrlEpic,
  SET_CONTENT,
  NOT_SUPPORTED_URL_PARAM_COMMAND
} from './editorDuck'
import { APP_START, URL_ARGUMENTS_CHANGE } from '../app/appDuck'
import { COMMAND_QUEUED, executeCommand } from '../commands/commandsDuck'

describe('editorDuck Epics', () => {
  let store
  const bus = createBus()
  const epicMiddleware = createEpicMiddleware(populateEditorFromUrlEpic)
  const mockStore = configureMockStore([
    epicMiddleware,
    createReduxMiddleware(bus)
  ])
  beforeAll(() => {
    store = mockStore({
      settings: {
        cmdchar: ':'
      }
    })
  })
  afterEach(() => {
    bus.reset()
    store.clearActions()
  })
  test('Sends a COMMAND_QUEUED event if cmd is "play"', done => {
    const cmd = 'play'
    const arg = 'test-guide'
    const action = {
      type: APP_START,
      url: `http://url.com?cmd=${cmd}&arg=${arg}`
    }

    bus.take(COMMAND_QUEUED, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        executeCommand(`:${cmd} ${arg}`)
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('Sends a SET_CONTENT event on initial url arguments', done => {
    const cmd = 'edit'
    const arg = 'RETURN 1'
    const action = {
      type: APP_START,
      url: `http://url.com?cmd=${cmd}&arg=${arg}`
    }

    bus.take(SET_CONTENT, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: SET_CONTENT, message: arg }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('Sends a SET_CONTENT event on url arguments change', done => {
    const cmd = 'edit'
    const arg = 'RETURN 1'
    const action = {
      type: URL_ARGUMENTS_CHANGE,
      url: `?cmd=${cmd}&arg=${arg}`
    }

    bus.take(SET_CONTENT, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: SET_CONTENT, message: arg }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('Handles the param command', done => {
    const cmd = 'param'
    const arg = 'x => 1'
    const action = {
      type: APP_START,
      url: `?cmd=${cmd}&arg=${encodeURIComponent(arg)}`
    }

    bus.take(SET_CONTENT, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: SET_CONTENT, message: `:${cmd} ${arg}` }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('Handles the params command', done => {
    const cmd = 'params'
    const arg = '{x: 1, y: "hello"}'
    const action = {
      type: APP_START,
      url: `?cmd=${cmd}&arg=${encodeURIComponent(arg)}`
    }

    bus.take(SET_CONTENT, currentAction => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: SET_CONTENT, message: `:${cmd} ${arg}` }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('Accepts one or more Cypher queries from URL params and populates the editor', done => {
    const cmd = 'edit'
    const args = ['RETURN 1;', 'RETURN rand();']
    const action = {
      type: APP_START,
      url:
        `http://url.com?cmd=${cmd}` +
        args.map(arg => `&arg=${encodeURIComponent(arg)}`).join('')
    }

    bus.take(SET_CONTENT, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        {
          type: SET_CONTENT,
          message: args.join('\n')
        }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
  test('Does not accept arbitrary URL params and populate the editor', done => {
    const cmd = 'not-supported'
    const arg = 'evil'
    const action = {
      type: APP_START,
      url: `http://url.com?cmd=${cmd}&arg=${arg}`
    }

    bus.take(NOT_SUPPORTED_URL_PARAM_COMMAND, () => {
      // Then
      expect(store.getActions()).toEqual([
        action,
        { type: NOT_SUPPORTED_URL_PARAM_COMMAND, command: cmd }
      ])
      done()
    })

    // When
    store.dispatch(action)
  })
})
