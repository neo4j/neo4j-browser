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

import {
  createLoadFavoritesPayload,
  fileContentToFavoriteFactory,
  getMissingFoldersFromNames
} from './file-drop.utils'

describe('file-drop.utils', () => {
  describe('getMissingFoldersFromNames', () => {
    const folderNames = ['foo', 'bar']
    const existingFolders = [{ name: 'foo' }, { name: 'baz' }]

    test('finds and creates missing folders based on folder name of imported favorite', () => {
      const expected = [{ name: 'bar', id: expect.any(String) }]

      expect(getMissingFoldersFromNames(folderNames, existingFolders)).toEqual(
        expected
      )
    })
  })

  describe('createLoadFavoritesPayload', () => {
    const importedFavorites = [
      { id: '1', contents: 'foo', folderName: 'foo' },
      { id: '2', contents: 'foo2', folderName: 'foo' },
      { id: '3', contents: 'bam' },
      { id: '4', contents: 'baz', folderName: 'baz' }
    ]
    const folders = [
      { name: 'foo', id: 'folder-1' },
      { name: 'baz', id: 'folder-2' }
    ]

    test('finds and creates missing folders based on folder name of imported favorite', () => {
      const expected = [
        { id: '1', content: 'foo', folder: 'folder-1' },
        { id: '2', content: 'foo2', folder: 'folder-1' },
        { id: '3', content: 'bam' },
        { id: '4', content: 'baz', folder: 'folder-2' }
      ]

      expect(createLoadFavoritesPayload(importedFavorites, folders)).toEqual(
        expected
      )
    })

    test('Handles references to non-existent folders', () => {
      const badImport = [
        ...importedFavorites,
        { id: '5', contents: 'impostor', folderName: 'not me' }
      ]
      const expected = [
        { id: '1', content: 'foo', folder: 'folder-1' },
        { id: '2', content: 'foo2', folder: 'folder-1' },
        { id: '3', content: 'bam' },
        { id: '4', content: 'baz', folder: 'folder-2' },
        { id: '5', content: 'impostor' }
      ]

      expect(createLoadFavoritesPayload(badImport, folders)).toEqual(expected)
    })
  })

  describe('fileContentToFavoriteFactory', () => {
    const rootLevelFile = {
      name: 'FooFile',
      contents: 'FooFileContents'
    }
    const subLevelFile = {
      name: '/Hello World/FooFile',
      contents: 'FooFileContents'
    }
    const nameCommentFile = {
      name: 'Hello World/Yet another day/FooFile',
      contents: '// Nome\nFooFileContents'
    }

    test('converts a root level file object to a favorite', () => {
      const expected = {
        id: expect.any(String),
        contents: rootLevelFile.contents,
        folderName: ''
      }

      expect(
        fileContentToFavoriteFactory(rootLevelFile)(rootLevelFile.contents)
      ).toEqual(expected)
    })

    test('converts a sub level file object to a favorite', () => {
      const expected = {
        id: expect.any(String),
        contents: subLevelFile.contents,
        folderName: 'Hello World'
      }

      expect(
        fileContentToFavoriteFactory(subLevelFile)(subLevelFile.contents)
      ).toEqual(expected)
    })

    test('converts a sub level file object to a favorite', () => {
      const expected = {
        id: expect.any(String),
        contents: nameCommentFile.contents,
        folderName: 'Hello World/Yet another day'
      }

      expect(
        fileContentToFavoriteFactory(nameCommentFile)(nameCommentFile.contents)
      ).toEqual(expected)
    })
  })
})
