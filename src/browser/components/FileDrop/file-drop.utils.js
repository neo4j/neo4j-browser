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
  assign,
  compact,
  endsWith,
  filter,
  flatMap,
  includes,
  join,
  keyBy,
  map,
  reverse,
  split,
  startsWith,
  tail,
  values
} from 'lodash-es'
import JSZip from 'jszip'
import uuid from 'uuid'

import { CYPHER_FILE_EXTENSION } from 'shared/services/export-favorites'

/**
 * Extracts folders from favorites
 * @param     {Object[]}    favorites
 * @return    {string[]}
 */
export function getFolderNamesFromFavorites(favorites) {
  return compact(map(favorites, 'folderName'))
}

/**
 * Returns new folder objects for those who do not have a matching name
 * @param     {string[]}    folderNames
 * @param     {Object[]}    allFolders
 * @return    {Object[]}
 */
export function getMissingFoldersFromNames(folderNames, allFolders) {
  const existingNames = map(allFolders, 'name')

  return map(
    filter(folderNames, folderName => !includes(existingNames, folderName)),
    name => ({
      name,
      id: uuid.v4()
    })
  )
}

/**
 * Creates a LOAD_FAVORITES payload complete with folder IDs when applicable
 * @param     {Object[]}    favoritesToAdd
 * @param     {Object[]}    allFolders
 * @return    {Object[]}
 */
export function createLoadFavoritesPayload(favoritesToAdd, allFolders) {
  const allFavoriteFolders = keyBy(allFolders, 'name')

  return map(favoritesToAdd, ({ id, contents, folderName }) =>
    assign(
      {
        id,
        content: contents
      },
      folderName in allFavoriteFolders
        ? { folder: allFavoriteFolders[folderName].id }
        : {}
    )
  )
}

/**
 * Extracts all .cypher files from a .zip archive and converts them to user scripts
 * @param     {File[]}                uploads uploaded .zip files
 * @return    {Promise<Object[]>}
 */
export async function readZipFiles(uploads) {
  const archives = await Promise.all(map(uploads, JSZip.loadAsync))
  const allFiles = flatMap(archives, ({ files }) => values(files))
  const onlyCypherFiles = filter(
    allFiles,
    ({ name }) =>
      !startsWith(name, '__MACOSX') && endsWith(name, CYPHER_FILE_EXTENSION)
  )

  return Promise.all(
    map(onlyCypherFiles, file =>
      file.async('string').then(fileContentToFavoriteFactory(file))
    )
  )
}

/**
 * Factory function returning a file to user script object mapper
 * @param     {File}        file
 * @return    {Function}            user scripts mapper
 */
export function fileContentToFavoriteFactory(file) {
  /**
   * Maps .zip archive file contents to a user script object
   * @param     {String}      contents    file contents
   * @return    {Object}                  user scripts object
   */
  return contents => {
    const pathWithoutLeadingSlash = startsWith(file.name, '/')
      ? file.name.slice(1)
      : file.name
    const pathParts = split(pathWithoutLeadingSlash, '/')
    const folderName = join(reverse(tail(reverse(pathParts))), '/')

    return { id: uuid.v4(), contents, folderName }
  }
}
