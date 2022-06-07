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
import reducer, {
  CLEAR_META,
  UPDATE_META,
  UPDATE_SERVER,
  UPDATE_SETTINGS
} from './dbMetaDuck'
import { APP_START } from 'shared/modules/app/appDuck'

describe('hydrating state', () => {
  test('should merge inital state and state on load', () => {
    // Given
    const action = { type: APP_START }

    // When
    const hydratedState = reducer({ foo: 'bar' } as any, action)

    // Then
    expect(hydratedState).toMatchSnapshot()
  })

  test('can update server settings', () => {
    // Given
    const initState: any = {
      shouldKeep: true
    }
    const action = {
      type: UPDATE_SETTINGS,
      settings: {
        'browser.test': 1
      }
    }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })

  test('can update server info', () => {
    // Given
    const initState: any = {
      shouldKeep: true
    }
    const action = {
      type: UPDATE_SERVER,
      version: '3.2.0-RC2',
      edition: 'enterprise',
      storeId: 'xxxx'
    }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })

  test('can CLEAR to reset state', () => {
    // Given
    const initState: any = {
      shouldKeep: false,
      server: {
        edition: 'enterprise',
        storeId: 'xxxx',
        version: '3.2.0-RC2'
      }
    }
    const action = {
      type: CLEAR_META
    }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })

  test('can update meta values with UPDATE', () => {
    // Given
    const initState: any = {
      myKey: 'val',
      noKey: true
    }
    const action = { type: UPDATE_META, myKey: 'yo', secondKey: true }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })
})
