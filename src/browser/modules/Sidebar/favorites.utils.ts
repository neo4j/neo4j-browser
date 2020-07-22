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
} from '@relate-by-ui/saved-scripts'

import { SLASH } from 'shared/services/export-favorites'
import arrayHasItems from 'shared/utils/array-has-items'

export type Favorite = {
  id: string
  name: string
  contents: string
  path: string
  isSuggestion: boolean
  folder?: Folder
}

export function getFirstFavorite(favorites: Favorite[]): Favorite | undefined {
  return head(favorites)
}

export function getFavoriteIds(favorites: Favorite[]): string[] {
  return map(favorites, 'id')
}

// TODO real type
export type Folder = { id: FolderId; name: string }
export type FolderId = string

export function getFolderFromPath(
  path: string,
  folders: Folder[]
): Folder | undefined {
  const name = omitScriptPathPrefix(SLASH, path)

  return find(folders, folder => folder.name === name)
}

export function getFolderFavorites(
  folderId: FolderId,
  allFavorites: Favorite[]
): Favorite[] {
  return filter(allFavorites, favo => favo.folder?.id === folderId)
}

export function folderHasRemainingFavorites(
  folderId: FolderId,
  favorites: Favorite[],
  allFavorites: Favorite[]
): boolean {
  const folderFavorites = getFolderFavorites(folderId, allFavorites)

  return arrayHasItems(
    without(getFavoriteIds(folderFavorites), ...getFavoriteIds(favorites))
  )
}

/**
 * Gets name and id for a folder given a certain path
 */
export function generateFolderNameAndIdForPath(
  path: string
): Partial<Favorite> {
  return {
    id: uuid.v4(),
    name: omitScriptPathPrefix(SLASH, path)
  }
}

/**
 * Adds a name comment on first line of query
 */
export function addNameComment(contents: string, newName: string): string {
  const parts = split(contents, '\n')
  const first = trim(head(parts) || '')
  // Lib seems to ask for a bigger type than needed
  // @ts-expect-error
  const oldName = trim(getScriptDisplayName({ contents }))

  if (startsWith(first, '//') && first === `// ${oldName}`) {
    return join([`// ${newName}`, ...tail(parts)], '\n')
  }

  return join([`// ${newName}`, ...parts], '\n')
}

export function mapNewFavoritesToOld(
  newFavorites: Favorite[],
  update: Partial<Favorite> = {}
): Record<string, any>[] {
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

export function updateFolder(
  folder: Folder,
  update: Partial<Folder>,
  allFolders: Folder[]
): Folder[] {
  return [
    ...filter(allFolders, ({ id }) => folder.id !== id),
    { ...folder, ...update }
  ]
}
