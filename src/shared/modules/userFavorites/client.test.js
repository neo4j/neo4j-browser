/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { assign, head, map, slice } from 'lodash-es'

import {
  createManyUserFavorites,
  createUserFavorite,
  getAllUserFavorites,
  removeManyUserFavorites,
  removeUserFavorite,
  updateManyUserFavorites,
  updateUserFavorite
} from './client'

import { reset } from './user-favorites.utils'

jest.mock('./user-favorites.utils', () => {
  const mockPrefix = '/foo/'
  const favs = [
    { path: mockPrefix, contents: 'bar', id: '1' },
    { path: `${mockPrefix}baz`, contents: 'bam', id: '2' }
  ]
  let mockFavorites = favs
  return {
    reset () {
      mockFavorites = favs
    },
    tryGetUserFavoritesLocalState () {
      return mockFavorites
    },
    setUserFavoritesLocalState (updated) {
      mockFavorites = updated
    }
  }
})

const mockPrefixCopy = '/foo/'
const mockFavoritesCopy = [
  { path: mockPrefixCopy, contents: 'bar', id: '1' },
  { path: `${mockPrefixCopy}baz`, contents: 'bam', id: '2' }
]

describe('userFavorites/client', () => {
  beforeEach(() => {
    reset()
  })

  describe('createUserFavorite', () => {
    test('should be unary', () => {
      expect(createUserFavorite.length).toBe(1)
    })
    test('should add one favorite to localstate', async () => {
      const data = { contents: 'bom' }
      const expected = { contents: 'bom', id: expect.any(String) }
      const newState = [...mockFavoritesCopy, expected]

      await expect(createUserFavorite(data)).resolves.toEqual(expected)
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })
  })

  describe('createManyUserFavorites', () => {
    test('should be unary', () => {
      expect(createManyUserFavorites.length).toBe(1)
    })

    test('should add one favorite to localstate', async () => {
      const data = [{ contents: 'bom' }]
      const expected = [{ contents: 'bom', id: expect.any(String) }]
      const newState = [...mockFavoritesCopy, ...expected]

      await expect(createManyUserFavorites(data)).resolves.toEqual(expected)
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })

    test('should add several favorites to localstate', async () => {
      const data = [{ contents: 'bom' }, { contents: 'apa' }]
      const expected = [
        { contents: 'bom', id: expect.any(String) },
        { contents: 'apa', id: expect.any(String) }
      ]
      const newState = [...mockFavoritesCopy, ...expected]

      await expect(createManyUserFavorites(data)).resolves.toEqual(expected)
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })
  })

  describe('updateUserFavorite', () => {
    test('should be binary', () => {
      expect(updateUserFavorite.length).toBe(2)
    })

    test('should update one favorite in localstate', async () => {
      const updateData = { contents: 'bom' }
      const expected = assign({}, head(mockFavoritesCopy), updateData)
      const newState = [...slice(mockFavoritesCopy, 1), expected]

      await expect(updateUserFavorite('1', updateData)).resolves.toEqual(
        expected
      )
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })
  })

  describe('updateManyUserFavorites', () => {
    test('should be binary', () => {
      expect(updateManyUserFavorites.length).toBe(2)
    })

    test('should update one favorite in localstate', async () => {
      const updateData = { contents: 'bom' }
      const expected = [assign({}, head(mockFavoritesCopy), updateData)]
      const newState = [...slice(mockFavoritesCopy, 1), ...expected]

      await expect(updateManyUserFavorites(['1'], updateData)).resolves.toEqual(
        expected
      )
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })

    test('should update several favorites in localstate', async () => {
      const updateData = { contents: 'bom' }
      const expected = map(mockFavoritesCopy, fav =>
        assign({}, fav, updateData)
      )

      await expect(
        updateManyUserFavorites(map(mockFavoritesCopy, 'id'), updateData)
      ).resolves.toEqual(expected)
      await expect(getAllUserFavorites()).resolves.toEqual(expected)
    })
  })

  describe('removeUserFavorite', () => {
    test('should be unary', () => {
      expect(removeUserFavorite.length).toBe(1)
    })

    test('should remove one favorite in localstate', async () => {
      const first = head(mockFavoritesCopy)
      const newState = slice(mockFavoritesCopy, 1)

      await expect(removeUserFavorite(first.id)).resolves.toEqual(first)
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })
  })

  describe('removeManyUserFavorites', () => {
    test('should be unary', () => {
      expect(removeManyUserFavorites.length).toBe(1)
    })

    test('should remove one favorite in localstate', async () => {
      const first = [head(mockFavoritesCopy)]
      const newState = slice(mockFavoritesCopy, 1)

      await expect(removeManyUserFavorites(map(first, 'id'))).resolves.toEqual(
        first
      )
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })

    test('should remove several favorites in localstate', async () => {
      const many = slice(mockFavoritesCopy, 0, 2)
      const newState = slice(mockFavoritesCopy, 2)

      await expect(removeManyUserFavorites(map(many, 'id'))).resolves.toEqual(
        many
      )
      await expect(getAllUserFavorites()).resolves.toEqual(newState)
    })
  })
})
