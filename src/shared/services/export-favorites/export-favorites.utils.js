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

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import dateFormat from 'dateformat'
import {
  compact,
  filter,
  forEach,
  get,
  join,
  kebabCase,
  last,
  map,
  slice,
  split
} from 'lodash-es'
import {
  addScriptPathPrefix,
  getScriptDisplayName,
  sortAndGroupScriptsByPath
} from '@relate-by-ui/saved-scripts'

import { SLASH, CYPHER_FILE_EXTENSION } from './export-favorites.constants'

/**
 * Converts old user favorites into new structure
 * @param     {Object[]}            favorites
 * @param     {Object[]}            folders
 * @param     {Function<boolean>}   isAllowed   checks if a favorite should be allowed
 * @return    {Object[]}                        new user favorites objects ("my scripts")
 */
export function mapOldFavoritesAndFolders(
  favorites,
  folders,
  isAllowed = isNonStatic
) {
  const oldFoldersMap = new Map(
    map(filter(folders, isAllowed), folder => [folder.id, folder])
  )
  const oldFilteredFavorites = filter(
    favorites,
    favorite => isAllowed(favorite) && hasContent(favorite)
  )

  return map(oldFilteredFavorites, favorite => {
    const folder = oldFoldersMap.get(favorite.folder)
    const newFavorite = {
      id: favorite.id,
      contents: favorite.content,
      path: addScriptPathPrefix(SLASH, get(folder, 'name', '')),
      isSuggestion: favorite.not_executable
    }

    if (folder) {
      return { ...newFavorite, folder }
    }

    return newFavorite
  })
}

/**
 * Array.prototype.filter predicate for removing static favorites and folders (old structure)
 * @param     {Object}      oldFavoriteOrFolder
 * @param     {Boolean}     oldFavoriteOrFolder.isStatic
 * @return    {Boolean}
 */
function isNonStatic({ isStatic }) {
  return !isStatic
}

/**
 * Array.prototype.filter predicate for removing old favorites without content
 * @param     {Object}      oldFavorite
 * @param     {String}      oldFavorite.content
 * @return    {Boolean}
 */
function hasContent({ content }) {
  return Boolean(content)
}

/**
 * Exports local favorites using JSZip
 * @param     {Object[]}    favorites
 * @param     {Object[]}    folders
 */
export function exportFavorites(favorites) {
  const grouped = sortAndGroupScriptsByPath(SLASH, favorites)
  const zipArchive = new JSZip()
  const dirMap = new Map([[SLASH, zipArchive]])
  const joinPathParts = pathParts =>
    pathParts.length > 1
      ? `${SLASH}${join(pathParts, SLASH)}`
      : `${SLASH}${join(pathParts, SLASH)}`

  zipArchive.file('.placeholder', 'forces directory creation')
  forEach(grouped, ([path, favorites]) => {
    const pathParts = compact(split(path, SLASH))
    const folderName = last(pathParts)
    const folderPath = joinPathParts(pathParts)
    const parentPath =
      joinPathParts(slice(pathParts, 0, pathParts.length - 1)) || SLASH
    const parent = dirMap.get(parentPath) || dirMap.get(SLASH)

    dirMap.set(folderPath, createZipDirAndFiles(parent, folderName, favorites))
  })

  zipArchive
    .generateAsync({ type: 'blob' })
    .then(blob =>
      saveAs(blob, `saved-scripts-${dateFormat(Date.now(), 'isoDateTime')}.zip`)
    )
}

/**
 * Creates a directory in a JSZip instance and populats files
 * @param     {JSZip}     parent      parent directory
 * @param     {string}    name        name of new dir
 * @param     {Object[]}  favorites   scripts to save
 * @return    {JSZip}                 created dir
 */
function createZipDirAndFiles(parent, name, favorites) {
  const dir = parent.folder(name)

  forEach(favorites, favorite => {
    const fileName = `${kebabCase(
      getScriptDisplayName(favorite)
    )}${CYPHER_FILE_EXTENSION}`

    dir.file(fileName, favorite.contents)
  })

  return dir
}
