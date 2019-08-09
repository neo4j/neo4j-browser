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

import { head, last, slice } from 'lodash-es'

import {
  BROWSER_FAVORITES_NAMESPACE,
  STATE_NAME,
  SYNC_VERSION_HISTORY_SIZE
} from './user-favorites.constants'
import {
  favoritesAreEqual,
  getAllRemoteFavoritesVersions,
  getLatestRemoteFavoritesVersionData,
  getLocalFavoritesFromState,
  getNewUserFavoriteSyncHistoryRevision,
  mapOldFavoritesAndFolders,
  mergeRemoteAndLocalFavorites,
  onlyNewFavorites
} from './user-favorites.utils'
import { getBrowserName } from '../../services/utils'

describe('user-favorites.utils', () => {
  describe('mapOldFavoritesAndFolders', () => {
    const oldFavorites = [
      { folder: '', content: 'foo' },
      { folder: 'bar', content: 'baz' },
      { folder: 'bar', content: 'bam' },
      { folder: 'bom', content: 'apa' }
    ]
    const oldFavoritesWithStatic = [
      { folder: '', content: 'foo' },
      { folder: 'bar', content: 'baz', isStatic: true },
      { folder: 'bar', content: 'bam' },
      { folder: 'bom', content: 'apa' }
    ]
    const oldFavoritesWithEmpty = [
      { folder: '', content: '' },
      { folder: 'bar', content: 'baz' },
      { folder: 'bar', content: 'bam' },
      { folder: 'bom', content: 'apa' }
    ]
    const oldFolders = [{ id: 'bar' }, { id: 'bom' }]
    const oldFoldersWithStatic = [{ id: 'bar' }, { id: 'bom', isStatic: true }]

    test('should map old favorites to new', () => {
      const expected = [
        { path: BROWSER_FAVORITES_NAMESPACE, contents: 'foo' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'baz' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'bam' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bom`, contents: 'apa' }
      ]

      expect(mapOldFavoritesAndFolders(oldFavorites, oldFolders)).toEqual(
        expected
      )
    })

    test('should ignore old static favorites', () => {
      const expected = [
        { path: BROWSER_FAVORITES_NAMESPACE, contents: 'foo' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'bam' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bom`, contents: 'apa' }
      ]

      expect(
        mapOldFavoritesAndFolders(oldFavoritesWithStatic, oldFolders)
      ).toEqual(expected)
    })

    test('should ignore old empty favorites', () => {
      const expected = [
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'baz' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'bam' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bom`, contents: 'apa' }
      ]

      expect(
        mapOldFavoritesAndFolders(oldFavoritesWithEmpty, oldFolders)
      ).toEqual(expected)
    })

    test('should remove old static folders', () => {
      const expected = [
        { path: BROWSER_FAVORITES_NAMESPACE, contents: 'foo' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'baz' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}/bar`, contents: 'bam' },
        { path: `${BROWSER_FAVORITES_NAMESPACE}`, contents: 'apa' }
      ]

      expect(
        mapOldFavoritesAndFolders(oldFavorites, oldFoldersWithStatic)
      ).toEqual(expected)
    })
  })

  describe('onlyNewFavorites', () => {
    const unsavedFavorites = [
      { contents: 'foo', path: '' },
      { contents: 'bam', path: 'bar' },
      { contents: 'baz', path: 'bam' },
      { contents: 'bom', path: 'bom' }
    ]

    describe('should filter out all unsaved with both contents and path matching', () => {
      const savedFavorites = slice(unsavedFavorites, 0, 2)
      const expected = slice(unsavedFavorites, 2)

      expect(onlyNewFavorites(unsavedFavorites, savedFavorites)).toEqual(
        expected
      )
    })

    describe('should NOT filter out unsaved with where either contents or path are not matching', () => {
      const savedFavorites = [
        { contents: 'foo', path: '2' },
        { contents: 'bam2', path: 'bar' }
      ]
      const expected = slice(unsavedFavorites, 2)

      expect(onlyNewFavorites(unsavedFavorites, savedFavorites)).toEqual(
        expected
      )
    })
  })

  describe('getLocalFavoritesFromState', () => {
    const favorites = [
      { contents: 'foo', path: '' },
      { contents: 'bam', path: 'bar' },
      { contents: 'baz', path: 'bam' },
      { contents: 'bom', path: 'bom' }
    ]
    const state = {
      [STATE_NAME]: {
        favorites
      }
    }

    test('should get favorites from state', () => {
      expect(getLocalFavoritesFromState(state)).toBe(favorites)
    })
  })

  describe('getAllRemoteFavoritesVersions', () => {
    const versions = [{ data: [] }, { data: [1, 2] }, { data: [3, 4] }]
    const syncObj = {
      [STATE_NAME]: versions
    }

    test('should get remote versions', () => {
      expect(getAllRemoteFavoritesVersions(syncObj)).toBe(versions)
    })
  })

  describe('getLatestRemoteFavoritesVersionData', () => {
    const versions = [{ data: [] }, { data: [1, 2] }, { data: [3, 4] }]
    const syncObj = {
      [STATE_NAME]: versions
    }

    test('should get latest remote version', () => {
      expect(getLatestRemoteFavoritesVersionData(syncObj)).toBe(head(versions))
    })
  })

  describe('getNewUserFavoriteSyncHistoryRevision', () => {
    const newData = ['foo']
    const newVersion = {
      client: getBrowserName(),
      data: newData,
      syncedAt: expect.any(Number)
    }
    const allVersionsShort = [{ data: [] }, { data: [1, 2] }, { data: [3, 4] }]
    const allVersionsLong = [
      { data: [] },
      { data: [1, 2] },
      { data: [3, 4] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] },
      { data: [] }
    ]

    test('should add a new version to beginning of version array', () => {
      const expected = [newVersion, ...allVersionsShort]

      expect(
        getNewUserFavoriteSyncHistoryRevision(allVersionsShort, newData)
      ).toEqual(expected)
    })

    test('should ensure version history does not exceed max', () => {
      const expected = [
        newVersion,
        ...slice(allVersionsLong, 0, SYNC_VERSION_HISTORY_SIZE)
      ]

      expect(
        getNewUserFavoriteSyncHistoryRevision(allVersionsLong, newData)
      ).toEqual(expected)
    })
  })

  describe('mergeRemoteAndLocalFavorites', () => {
    const remoteFavorites = [{ id: '1' }, { id: '2' }, { id: '3' }]
    const localFavorites = [
      { id: '1', foo: true },
      { id: '2', foo: true },
      { id: '4' },
      { id: '5' }
    ]

    const expected = [last(remoteFavorites), ...localFavorites]

    test('merges favorites using id, prioritising local', () => {
      expect(
        mergeRemoteAndLocalFavorites(remoteFavorites, localFavorites)
      ).toEqual(expected)
    })
  })

  describe('favoritesAreEqual', () => {
    describe('naively compares two arrays of favorites by id', () => {
      const favoritesA = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const favoritesB = [
        { id: '1', foo: true },
        { id: '2', bar: true },
        { id: '3' }
      ]
      const favoritesC = [{ id: '1' }, { id: '2' }, { id: '5' }]
      const favoritesD = [{ id: '1' }, { id: '2' }, { id: '4' }, { id: '5' }]

      test('returns true if all ids are same, even if rest is not', () => {
        expect(favoritesAreEqual(favoritesA, favoritesB)).toBe(true)
      })

      test('returns false even if same length', () => {
        expect(favoritesAreEqual(favoritesA, favoritesC)).toBe(false)
      })
      test('returns false even if not same length', () => {
        expect(favoritesAreEqual(favoritesA, favoritesD)).toBe(false)
      })
    })
  })
})
