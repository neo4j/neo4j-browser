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

import { SLASH } from './export-favorites.constants'
import { mapOldFavoritesAndFolders } from './export-favorites.utils'

describe('user-favorites.utils', () => {
  describe('mapOldFavoritesAndFolders', () => {
    const oldFavorites = [
      { folder: '', content: 'foo', id: '1' },
      { folder: 'bar', content: 'baz', id: '2' },
      { folder: 'bar', content: 'bam', id: '3' },
      { folder: 'bom', content: 'apa', id: '4' }
    ]
    const oldFavoritesWithStatic = [
      { folder: '', content: 'foo', id: '1' },
      { folder: 'bar', content: 'baz', isStatic: true, id: '2' },
      { folder: 'bar', content: 'bam', id: '3' },
      { folder: 'bom', content: 'apa', id: '4' }
    ]
    const oldFavoritesWithEmpty = [
      { folder: '', content: '', id: '1' },
      { folder: 'bar', content: 'baz', id: '2' },
      { folder: 'bar', content: 'bam', id: '3' },
      { folder: 'bom', content: 'apa', id: '4' }
    ]
    const oldFolders = [{ id: 'bar', name: 'bar' }, { id: 'bom', name: 'bom' }]
    const oldFoldersWithStatic = [
      { id: 'bar', name: 'bar' },
      { id: 'bom', name: 'bom', isStatic: true }
    ]

    test('should map old favorites to new', () => {
      const expected = [
        { path: SLASH, contents: 'foo', id: '1' },
        {
          path: `${SLASH}bar`,
          contents: 'baz',
          id: '2',
          folder: { id: 'bar', name: 'bar' }
        },
        {
          path: `${SLASH}bar`,
          contents: 'bam',
          id: '3',
          folder: { id: 'bar', name: 'bar' }
        },
        {
          path: `${SLASH}bom`,
          contents: 'apa',
          id: '4',
          folder: { id: 'bom', name: 'bom' }
        }
      ]

      expect(mapOldFavoritesAndFolders(oldFavorites, oldFolders)).toEqual(
        expected
      )
    })

    test('should ignore old static favorites', () => {
      const expected = [
        { path: SLASH, contents: 'foo', id: '1' },
        {
          path: `${SLASH}bar`,
          contents: 'bam',
          id: '3',
          folder: { id: 'bar', name: 'bar' }
        },
        {
          path: `${SLASH}bom`,
          contents: 'apa',
          id: '4',
          folder: { id: 'bom', name: 'bom' }
        }
      ]

      expect(
        mapOldFavoritesAndFolders(oldFavoritesWithStatic, oldFolders)
      ).toEqual(expected)
    })

    test('should ignore old empty favorites', () => {
      const expected = [
        {
          path: `${SLASH}bar`,
          contents: 'baz',
          id: '2',
          folder: { id: 'bar', name: 'bar' }
        },
        {
          path: `${SLASH}bar`,
          contents: 'bam',
          id: '3',
          folder: { id: 'bar', name: 'bar' }
        },
        {
          path: `${SLASH}bom`,
          contents: 'apa',
          id: '4',
          folder: { id: 'bom', name: 'bom' }
        }
      ]

      expect(
        mapOldFavoritesAndFolders(oldFavoritesWithEmpty, oldFolders)
      ).toEqual(expected)
    })

    test('should remove old static folders', () => {
      const expected = [
        { path: SLASH, contents: 'foo', id: '1' },
        {
          path: `${SLASH}bar`,
          contents: 'baz',
          id: '2',
          folder: { id: 'bar', name: 'bar' }
        },
        {
          path: `${SLASH}bar`,
          contents: 'bam',
          id: '3',
          folder: { id: 'bar', name: 'bar' }
        },
        { path: `${SLASH}`, contents: 'apa', id: '4' }
      ]

      expect(
        mapOldFavoritesAndFolders(oldFavorites, oldFoldersWithStatic)
      ).toEqual(expected)
    })
  })
})
