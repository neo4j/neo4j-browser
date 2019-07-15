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

import { filter, map, some } from 'lodash-es'
import { addScriptPathPrefix } from '../../../browser/modules/my-scripts/my-scripts.utils'
import { BROWSER_FAVOURITES_NAMESPACE } from './user-favorites.constants'

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
