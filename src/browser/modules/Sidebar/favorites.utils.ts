/*
 * Copyright (c) 2002-2021 "Neo4j,"
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
  split,
  startsWith,
  tail,
  trim,
  without
} from 'lodash-es'
import {
  getScriptDisplayName,
  omitScriptPathPrefix
} from 'browser/components/SavedScripts'

import { SLASH } from 'shared/services/export-favorites'
import arrayHasItems from 'shared/utils/array-has-items'

/**
 * Get first favorite
 * @param     {Object[]}        favorites
 * @return    {Object|null}
 */
export function getFirstFavorite(favorites: any) {
  return head(favorites)
}

/**
 * Get favorite ids
 * @param     {Object[]}        favorites
 * @return    {string[]}
 */
export function getFavoriteIds(favorites: any) {
  return map(favorites, 'id')
}

/**
 * Finds a folder for a given path
 * @param     {string}    path
 * @param     {Object[]}  folders
 * @return    {string}
 */
export function getFolderFromPath(path: any, folders: any) {
  const name = omitScriptPathPrefix(SLASH, path)

  return find(folders, folder => folder.name === name)
}

/**
 * Gets favorites for a given folder
 * @param     {string}      folderId
 * @param     {Object[]}    allFavorites
 * @return    {Object[]}
 */
export function getFolderFavorites(folderId: any, allFavorites: any) {
  return filter(allFavorites, ({ folder }) => folder && folderId === folder.id)
}

/**
 * Returns all favorites for a given folder not present in first list
 * @param     {string}      folderId
 * @param     {Object[]}    favorites
 * @param     {Object[]}    allFavorites
 * @return    {Object[]}
 */
export function folderHasRemainingFavorites(
  folderId: any,
  favorites: any,
  allFavorites: any
) {
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
export function generateFolderNameAndIdForPath(path: any) {
  return {
    id: uuid.v4(),
    name: omitScriptPathPrefix(SLASH, path)
  }
}

/**
 * Adds a name comment on first line of query
 * @param     {string}    contents
 * @param     {string}    newName
 * @return    {string}
 */
export function addNameComment(contents: any, newName: any) {
  const parts = split(contents, '\n')
  const first = trim(head(parts) || '')
  const oldName = trim(getScriptDisplayName({ contents } as any))

  if (startsWith(first, '//') && first === `// ${oldName}`) {
    return join([`// ${newName}`, ...tail(parts)], '\n')
  }

  return join([`// ${newName}`, ...parts], '\n')
}

/**
 * Converts new favorites to old structure
 * @param     {Object[]}    newFavorites
 * @param     {Object}      update
 * @return    {Object[]}
 */
export function mapNewFavoritesToOld(newFavorites: any, update: any = {}) {
  return map(newFavorites, ({ id, folder, contents }) =>
    assign(
      {
        id,
        content: update.name ? addNameComment(contents, update.name) : contents
      },
      folder ? { folder: folder.id } : {},
      omit(update, 'name')
    )
  )
}

export function updateFolder(folder: any, update: any, allFolders: any) {
  return [
    ...filter(allFolders, ({ id }) => folder.id !== id),
    { ...folder, ...update }
  ]
}

export function defaultFavoriteName(cmd: any) {
  const firstLine = cmd.split('\n')[0]

  if (firstLine.startsWith('//')) {
    return firstLine.slice(2)
  } else {
    return firstLine
  }
}
