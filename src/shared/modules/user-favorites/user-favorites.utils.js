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

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import dateFormat from 'dateformat'
import {
  compact,
  filter,
  forEach,
  join,
  kebabCase,
  last,
  map,
  slice,
  some,
  split
} from 'lodash-es'

import {
  addScriptPathPrefix,
  getScriptDisplayName,
  sortAndGroupScriptsByPath
} from '../../../browser/modules/my-scripts/my-scripts.utils'
import {
  BROWSER_FAVORITES_EXPORT_URL,
  BROWSER_FAVOURITES_NAMESPACE,
  LOCAL_STORAGE_NAMESPACE,
  USE_REST_API
} from './user-favorites.constants'

/**
 * Opens a new window/tab
 * @param     {String}    href
 * @param     {String}    target
 */
export function openNewWindow (href, target = 'blank') {
  // @todo: electron support
  window.open(href, target)
}

/**
 * Converts old user favorites into new structure
 * @param     {Object[]}    oldFavorites
 * @param     {Object[]}    oldFolders
 * @return    {Object[]}                    new user favorites objects ("my scripts")
 */
export function mapOldFavoritesAndFolders (oldFavorites, oldFolders) {
  const oldFoldersMap = new Map(
    map(filter(oldFolders, isNonStatic), folder => [folder.id, folder])
  )
  const oldFilteredFavorites = filter(
    oldFavorites,
    favorite => isNonStatic(favorite) && hasContent(favorite)
  )

  return map(oldFilteredFavorites, favorite => {
    const folder = oldFoldersMap.get(favorite.folder)

    return {
      contents: favorite.content,
      path: addScriptPathPrefix(
        BROWSER_FAVOURITES_NAMESPACE,
        folder ? folder.name : ''
      )
    }
  })
}

/**
 * Array.prototype.filter predicate for removing static favorites and folders (old structure)
 * @param     {Object}      oldFavoriteOrFolder
 * @param     {Boolean}     oldFavoriteOrFolder.isStatic
 * @return    {Boolean}
 */
function isNonStatic ({ isStatic }) {
  return !isStatic
}

/**
 * Array.prototype.filter predicate for removing old favorites without content
 * @param     {Object}      oldFavorite
 * @param     {String}      oldFavorite.content
 * @return    {Boolean}
 */
function hasContent ({ content }) {
  return Boolean(content)
}

/**
 * Returns all unsaved favorites that are not already represented in the saved dataset
 * @param     {Object[]}    unsavedFavorites
 * @param     {Object[]}    savedFavorites
 * @return    {Object[]}                        unsaved favorites that do not have a peer in shared
 */
export function onlyNewFavorites (unsavedFavorites, savedFavorites) {
  return filter(
    unsavedFavorites,
    unsaved =>
      !some(
        savedFavorites,
        saved =>
          saved.contents === unsaved.contents && saved.path === unsaved.path
      )
  )
}

/**
 * Gracefully try to get user favorites from localStorage
 * @return    {Object[]}
 */
export function tryGetUserFavoritesLocalState () {
  try {
    return (
      JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_NAMESPACE)) || []
    )
  } catch (e) {
    return []
  }
}

/**
 * Set user favorites in localStorage
 * @param     {Object[]}    value     new localstorage value
 */
export function setUserFavoritesLocalState (value) {
  window.localStorage.setItem(LOCAL_STORAGE_NAMESPACE, JSON.stringify(value))
}

/**
 * Triggers a user favorite export
 */
export function exportFavorites () {
  if (USE_REST_API) {
    // @todo: electron support
    openNewWindow(BROWSER_FAVORITES_EXPORT_URL)
    return
  }

  localFavoritesExport()
}

/**
 * Exports local favorites using JSZip
 * - Attempts to mirror output from userdata-store API /raw equivalent
 */
export function localFavoritesExport () {
  const localFavorites = tryGetUserFavoritesLocalState()
  const grouped = sortAndGroupScriptsByPath(
    BROWSER_FAVOURITES_NAMESPACE,
    localFavorites
  )
  const zipArchive = new JSZip()
  const dirMap = new Map([['/', zipArchive]])
  const joinPathParts = pathParts =>
    pathParts.length > 1 ? `/${join(pathParts, '/')}/` : join(pathParts, '/')

  zipArchive.file('.placeholder', 'forces directory creation')
  forEach(grouped, ([path, favorites]) => {
    const pathParts = compact(split(path, '/'))
    const folderName = last(pathParts)
    const folderPath = joinPathParts(pathParts)
    const parentPath =
      joinPathParts(slice(pathParts, 0, pathParts.length - 1)) || '/'
    const parent = dirMap.get(parentPath) || dirMap.get('/')

    dirMap.set(folderPath, createZipDirAndFiles(parent, folderName, favorites))
  })

  zipArchive
    .generateAsync({ type: 'blob' })
    .then(blob =>
      saveAs(blob, `my-scripts-${dateFormat(Date.now(), 'isoDateTime')}.zip`)
    )
}

function createZipDirAndFiles (parent, name, favorites) {
  const dir = parent.folder(name)

  forEach(favorites, favorite => {
    const fileName = `${kebabCase(getScriptDisplayName(favorite))}.cypher`

    dir.file(fileName, favorite.contents)
  })

  return dir
}
