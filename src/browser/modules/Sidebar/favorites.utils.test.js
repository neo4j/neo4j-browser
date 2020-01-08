/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import { filter, find, head } from 'lodash-es'

import {
  addNameComment,
  folderHasRemainingFavorites,
  generateFolderNameAndIdForPath,
  getFolderFavorites,
  getFolderFromPath,
  mapNewFavoritesToOld,
  updateFolder
} from './favorites.utils'

describe('favorites.utils', () => {
  describe('getFolderFromPath', () => {
    test('finds folders using their path as name', () => {
      const path = '/foo'
      const folders = [{ name: 'foo' }, { name: 'bar' }, { name: 'bam' }]

      expect(getFolderFromPath(path, folders)).toBe(head(folders))
    })
  })

  describe('getFolderFavorites', () => {
    const favorites = [
      { folder: { id: 1 }, name: 'foo' },
      { folder: { id: 'apa' }, name: 'bar' },
      { folder: { id: 1 }, name: 'bam' },
      { folder: { id: 3 }, name: 'baz' },
      { name: 'donkey' }
    ]

    test('finds folders favorites using their IDs', () => {
      const expected = filter(
        favorites,
        ({ folder }) => folder && folder.id === 1
      )

      expect(getFolderFavorites(1, favorites)).toEqual(expected)
    })

    test('does not include favorites without folders, even when passed non-existent ID', () => {
      expect(getFolderFavorites('nope not me', favorites)).toEqual([])
    })

    test('does not care what type folder ID is', () => {
      const expected = filter(
        favorites,
        ({ folder }) => folder && folder.id === 'apa'
      )

      expect(getFolderFavorites('apa', favorites)).toEqual(expected)
    })

    test('does not care what type folder ID is', () => {
      const expected = filter(
        favorites,
        ({ folder }) => folder && folder.id === 'apa'
      )

      expect(getFolderFavorites('apa', favorites)).toEqual(expected)
    })
  })

  describe('folderHasRemainingFavorites', () => {
    const allFavorites = [
      { folder: { id: 1 }, name: 'foo', id: '1' },
      { folder: { id: 'apa' }, name: 'bar', id: '2' },
      { folder: { id: 1 }, name: 'bam', id: '3' },
      { folder: { id: 3 }, name: 'baz', id: '4' },
      { name: 'donkey', id: '5' }
    ]

    test('returns true if folder has favorites remaining', () => {
      const first = find(
        allFavorites,
        ({ folder }) => folder && folder.id === 1
      )

      expect(folderHasRemainingFavorites(1, [first], allFavorites)).toBe(true)
    })

    test('returns false if folder does not have favorites remaining', () => {
      const first = find(
        allFavorites,
        ({ folder }) => folder && folder.id === 'apa'
      )

      expect(folderHasRemainingFavorites('apa', [first], allFavorites)).toBe(
        false
      )
    })

    test('returns false if folder does not exist', () => {
      const first = find(
        allFavorites,
        ({ folder }) => folder && folder.id === 'definitely not me either'
      )

      expect(
        folderHasRemainingFavorites(
          'definitely not me either',
          [first],
          allFavorites
        )
      ).toBe(false)
    })
  })

  describe('generateFolderNameAndIdForPath', () => {
    test('creates name for a given path', () => {
      const path = '/foo'
      const expected = {
        name: 'foo',
        id: expect.any(String)
      }

      expect(generateFolderNameAndIdForPath(path)).toEqual(expected)
    })

    test('only omits the leading slash', () => {
      const path = '/foo/bar'
      const expected = {
        name: 'foo/bar',
        id: expect.any(String)
      }

      expect(generateFolderNameAndIdForPath(path)).toEqual(expected)
    })

    test('does not affect whitespace or casing', () => {
      const path = '/Foo/b   ar'
      const expected = {
        name: 'Foo/b   ar',
        id: expect.any(String)
      }

      expect(generateFolderNameAndIdForPath(path)).toEqual(expected)
    })
  })

  describe('addNameComment', () => {
    test('adds name as a comment to top of a query', () => {
      const name = 'foo'
      const contents = ['RETURN 1'].join('\n')
      const expected = [`// ${name}`, 'RETURN 1'].join('\n')

      expect(addNameComment(contents, name)).toBe(expected)
    })

    test('adds name as a comment to top of a query, replacing old name', () => {
      const name = 'foo'
      const contents = ['// old name', 'RETURN 1'].join('\n')
      const expected = [`// ${name}`, 'RETURN 1'].join('\n')

      expect(addNameComment(contents, name)).toBe(expected)
    })

    test('adds name as a comment to top of a query, without replacing additional comments', () => {
      const name = 'foo'
      const contents = ['// old name', '// random comment', 'RETURN 1'].join(
        '\n'
      )
      const expected = [`// ${name}`, '// random comment', 'RETURN 1'].join(
        '\n'
      )

      expect(addNameComment(contents, name)).toBe(expected)
    })
  })

  describe('mapNewFavoritesToOld', () => {
    const newFavorites = [
      {
        id: '1',
        contents: 'RETURN 1'
      },
      {
        id: '2',
        contents: 'RETURN 2',
        folder: { id: 'apa' }
      }
    ]

    test('converts new favorites structure to old', () => {
      const expected = [
        {
          id: '1',
          content: 'RETURN 1'
        },
        {
          id: '2',
          content: 'RETURN 2',
          folder: 'apa'
        }
      ]

      expect(mapNewFavoritesToOld(newFavorites)).toEqual(expected)
    })

    test('converts new favorites structure to old, applying an updated name to each', () => {
      const update = {
        name: 'foo'
      }
      const expected = [
        {
          id: '1',
          content: '// foo\nRETURN 1'
        },
        {
          id: '2',
          content: '// foo\nRETURN 2',
          folder: 'apa'
        }
      ]

      expect(mapNewFavoritesToOld(newFavorites, update)).toEqual(expected)
    })

    test('converts new favorites structure to old, applying an updated folder to each', () => {
      const update = {
        folder: 'foo'
      }
      const expected = [
        {
          id: '1',
          content: 'RETURN 1',
          folder: 'foo'
        },
        {
          id: '2',
          content: 'RETURN 2',
          folder: 'foo'
        }
      ]

      expect(mapNewFavoritesToOld(newFavorites, update)).toEqual(expected)
    })

    test('converts new favorites structure to old, applying an updated folder and name to each', () => {
      const update = {
        name: 'bar',
        folder: 'foo'
      }
      const expected = [
        {
          id: '1',
          content: '// bar\nRETURN 1',
          folder: 'foo'
        },
        {
          id: '2',
          content: '// bar\nRETURN 2',
          folder: 'foo'
        }
      ]

      expect(mapNewFavoritesToOld(newFavorites, update)).toEqual(expected)
    })
  })

  describe('updateFolder', () => {
    const folders = [{ id: '1' }, { id: '2' }, { id: '3' }]

    test('updates the one or more properties of a folder', () => {
      const update = { name: 'bar', foo: true }
      const expected = [{ id: '1' }, { id: '3' }, { id: '2', ...update }]

      expect(updateFolder({ id: '2' }, update, folders)).toEqual(expected)
    })
  })
})
