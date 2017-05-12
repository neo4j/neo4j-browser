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

/* global test, expect */
import reducer, * as currentUser from './currentUserDuck'
import { dehydrate } from 'services/duckUtils'

describe('user reducer current info', () => {
  test('handles unknown action type', () => {
    const action = {
      type: 'UNKNOWN',
      info: {}
    }
    const nextState = reducer(undefined, action)
    expect(dehydrate(nextState)).toEqual({info: null})
  })
  test('should have no info', () => {
    const action = {
      type: currentUser.UPDATE_CURRENT_USER,
      info: null
    }
    const nextState = reducer(undefined, action)
    expect(Object.keys(nextState).indexOf('info')).toBeGreaterThan(-1)
    expect(nextState.info).toEqual(null)
  })
  test('should set info', () => {
    const action = {
      type: currentUser.UPDATE_CURRENT_USER,
      info: {username: 'username', roles: ['king']}
    }
    const nextState = reducer({a: 'b'}, action)
    expect(nextState.info).toEqual({username: 'username', roles: ['king']})
  })
})

describe('User info actions', () => {
  test('should handle updating current user', () => {
    const username = 'username'
    const roles = 'roles'
    const expectedUser = {username, roles}
    expect(currentUser.updateCurrentUser(username, roles)).toEqual({
      type: currentUser.UPDATE_CURRENT_USER,
      info: expectedUser
    })
  })
})
