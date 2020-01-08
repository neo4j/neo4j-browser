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

import uuid from 'uuid'
import reducer, * as favorites from './favoritesDuck'

describe('favorites reducer', () => {
  test('should allow id to be injected when adding a favorite', () => {
    const action = {
      type: favorites.ADD_FAVORITE,
      id: 'foo',
      cmd: 'bar'
    }
    const nextState = reducer([], action)
    expect(nextState.length).toBe(1)

    const actual = nextState[0]
    expect(actual.id).toEqual('foo')
    expect(actual.content).toEqual('bar')
  })
  test('should generate an id when adding a favorite and only passing cmd value', () => {
    const action = {
      type: favorites.ADD_FAVORITE,
      cmd: 'bar'
    }
    const nextState = reducer([], action)
    expect(nextState.length).toBe(1)

    const actual = nextState[0]
    expect(actual.id).not.toBeFalsy()
    expect(actual.content).toEqual('bar')
  })
  test('should update state for favorites when favorite is removed and only one item is in the list', () => {
    const favoriteScript = {
      name: 'Test1',
      content: 'match (n) return n limit 1'
    }
    const initialState = [favoriteScript]
    const action = {
      type: favorites.REMOVE_FAVORITE,
      favorites: [favoriteScript]
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual([])
  })

  test('should update state for favorites when favorite is removed when there is more than one item in the list', () => {
    const favoriteScript1 = {
      id: uuid.v4(),
      name: 'Test1',
      content: 'match (n) return n limit 1'
    }
    const favoriteScript2 = {
      id: uuid.v4(),
      name: 'Test2',
      content: 'match (a) return a'
    }
    const favoriteScript3 = {
      id: uuid.v4(),
      name: 'Test3',
      content: 'match (a) return a'
    }
    const initialState = [favoriteScript1, favoriteScript2, favoriteScript3]
    const action = {
      type: favorites.REMOVE_FAVORITE,
      id: favoriteScript2.id
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual([favoriteScript1, favoriteScript3])
  })
  test('should return favorite by id', () => {
    const favoriteScript1 = {
      id: uuid.v4(),
      name: 'Test1',
      content: 'match (n) return n limit 1'
    }
    const favoriteScript2 = {
      id: uuid.v4(),
      name: 'Test2',
      content: 'match (a) return a'
    }
    const initialState = [favoriteScript1, favoriteScript2]

    const nextState = reducer(initialState, {})
    expect(favorites.getFavorite(nextState, favoriteScript1.id)).toEqual(
      favoriteScript1
    )
    expect(favorites.getFavorite(nextState, favoriteScript2.id)).toEqual(
      favoriteScript2
    )
  })
  test('should update favorite by id', () => {
    const favoriteScript1 = {
      id: uuid.v4(),
      name: 'Test1',
      content: 'match (n) return n limit 1'
    }
    const favoriteScript2 = {
      id: uuid.v4(),
      name: 'Test2',
      content: 'match (a) return a'
    }
    const initialState = [favoriteScript1, favoriteScript2]
    const newContent = '//Foobar'
    const action = {
      type: favorites.UPDATE_FAVORITE,
      id: favoriteScript1.id,
      cmd: newContent
    }
    const nextState = reducer(initialState, action)
    expect(favorites.getFavorite(nextState, favoriteScript1.id)).toEqual({
      ...favoriteScript1,
      content: newContent
    })
    expect(favorites.getFavorite(nextState, favoriteScript2.id)).toEqual(
      favoriteScript2
    )
  })
})

describe('favorites actions', () => {
  test('should handle loading favorites', () => {
    const favs = 'favorites object'
    const expected = {
      type: favorites.LOAD_FAVORITES,
      favorites: favs
    }
    expect(favorites.loadFavorites(favs)).toEqual(expected)
  })
  test('should handle removing favorite', () => {
    const id = uuid.v4()
    const expected = {
      type: favorites.REMOVE_FAVORITE,
      id
    }
    expect(favorites.removeFavorite(id)).toEqual(expected)
  })
})
