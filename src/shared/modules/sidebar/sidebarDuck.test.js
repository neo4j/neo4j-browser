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

import reducer, * as sidebar from './sidebarDuck'

describe('sidebar reducer', () => {
  test('should set to undefined if no drawer is in payload', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(null)
  })

  test('should set to undefined if drawer in payload is falsy', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: { drawer: '' }
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(null)
  })

  test('should open a drawer when closed', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: { drawer: 'db' }
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual('db')
  })

  test('should switch drawer when a different one already is open', () => {
    const initialState = 'profile'
    const action = {
      type: sidebar.TOGGLE,
      state: { drawer: 'db' }
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual('db')
  })

  test('should close drawer when the opened one is toggled', () => {
    const initialState = 'db'
    const action = {
      type: sidebar.TOGGLE,
      state: { drawer: 'db' }
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(null)
  })
})

describe('Sidebar actions', () => {
  test('should handle toggling drawer', () => {
    const drawerId = 'db'
    expect(sidebar.toggle(drawerId)).toEqual({
      type: sidebar.TOGGLE,
      state: { drawer: drawerId }
    })
  })
})
