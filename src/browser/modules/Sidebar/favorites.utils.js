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

import uuid from 'uuid'
import {
  assign,
  filter,
  find,
  head,
  join,
  map,
  omit,
  some,
  split,
  startsWith,
  tail,
  trim,
  without
} from 'lodash-es'
import { omitScriptPathPrefix } from '@relate-by-ui/saved-scripts'

import { SLASH } from 'shared/services/export-favorites'
import arrayHasItems from 'shared/utils/array-has-items'

/**
 * Get first favorite
 * @param     {Object[]}        favorites
 * @return    {Object|null}
 */
export function getFirstFavorite (favorites) {
  return head(favorites)
}

/**
 * Get favorite ids
 * @param     {Object[]}        favorites
 * @return    {string[]}
 */
export function getFavoriteIds (favorites) {
  return map(favorites, 'id')
}

/**
 * Finds a folder for a given path
 * @param     {string}    path
 * @param     {Object[]}  folders
 * @return    {string}
 */
export function getFolderFromPath (path, folders) {
  const name = omitScriptPathPrefix(SLASH, path)

  return find(folders, folder => folder.name === name)
}

/**
 * Gets favorites for a given folder
 * @param     {string}      folderId
 * @param     {Object[]}    allFavorites
 * @return    {Object[]}
 */
export function getFolderFavorites (folderId, allFavorites) {
  return filter(allFavorites, ({ folder }) => folder && folderId === folder.id)
}

/**
 * Returns all favorites not present in first arg
 * @param     {string}      folderId
 * @param     {Object[]}    favorites
 * @param     {Object[]}    allFavorites
 * @return    {Object[]}
 */
export function folderHasRemainingFavorites (folderId, favorites, allFavorites) {
  const folderFavorites = getFolderFavorites(folderId, allFavorites)

  return arrayHasItems(
    without(getFavoriteIds(folderFavorites), ...getFavoriteIds(favorites))
  )
}

/**
 * Gets name and id for a folder given a certain path
 * @param     {string}                      path
 * @return    {{id: string, name: string}}
 */
export function generateFolderNameAndIdForPath (path) {
  return {
    id: uuid.v4(),
    name: omitScriptPathPrefix(SLASH, path)
  }
}

/**
 * Restores an array of broken favorites
 * - For example drag n drop returns array of objects containing only id
 * @param     {Object[]}    brokenFavorites
 * @param     {Object[]}    allFavorites
 * @return    {Object[]}
 */
export function restoreBrokenFavorites (brokenFavorites, allFavorites) {
  return filter(allFavorites, ({ id }) =>
    some(brokenFavorites, favorite => favorite.id === id)
  )
}

/**
 * Adds a name comment on first line of query
 * @param     {string}    content
 * @param     {string}    name
 * @return    {string}
 */
export function addNameComment (content, name) {
  const parts = split(content, '\n')
  const first = trim(head(parts))

  if (startsWith(first, '//')) {
    return join([`// ${name}`, ...tail(parts)], '\n')
  }

  return join([`// ${name}`, ...parts], '\n')
}

/**
 * Converts new favorites to old structure
 * @param     {Object[]}    newFavorites
 * @param     {Object}      update
 * @return    {Object[]}
 */
export function mapNewFavoritesToOld (newFavorites, update = {}) {
  return map(newFavorites, ({ id, folder, contents }) =>
    assign(
      {
        id,
        content: update.name ? addNameComment(contents, update.name) : contents,
        folder: folder && folder.id
      },
      omit(update, 'name')
    )
  )
}

export function updateFolder (folder, update, allFolders) {
  return [...without(allFolders, folder), { ...folder, ...update }]
}
