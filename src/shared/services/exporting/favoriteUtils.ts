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

import JSZip from 'jszip'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { saveAs } from 'file-saver' // Polyfill for FF
import { getScriptDisplayName } from 'browser/components/SavedScripts'
import { Folder } from 'shared/modules/favorites/foldersDuck'

export const CYPHER_FILE_EXTENSION = '.cypher'

export function exportFavoritesAsBigCypherFile(favorites: Favorite[]): void {
  const fileContent = favorites
    .reduce(
      (acc, curr) => `${acc}

${curr.content}`,
      ''
    )
    .trim()

  saveAs(
    new Blob([fileContent], { type: 'text/csv' }),
    `saved-scripts-${new Date().toISOString().split('T')[0]}.cypher`
  )
}

type WriteableFavorite = {
  content: string
  fullFilename: string
}
export function exportFavorites(
  favorites: Favorite[],
  folders: Folder[]
): void {
  const zip = new JSZip()
  transformFavoriteAndFolders(favorites, folders).forEach(
    ({ content, fullFilename }) => {
      zip.file(fullFilename, content)
    }
  )

  zip
    .generateAsync({ type: 'blob' })
    .then(blob =>
      saveAs(
        blob,
        `saved-scripts-${new Date().toISOString().split('T')[0]}.zip`
      )
    )
}

function toSafefilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '')
}

function transformFavoriteAndFolders(
  favorites: Favorite[],
  folders: Folder[] = []
): WriteableFavorite[] {
  return favorites.map(fav => {
    const { content, folder: folderId } = fav
    const name = toSafefilename(getScriptDisplayName(fav))
    const nameWithExtension = `${name}${CYPHER_FILE_EXTENSION}`

    const folderName = folders.find(folder => folder.id === folderId)?.name

    return {
      content,
      fullFilename: folderName
        ? [toSafefilename(folderName), nameWithExtension].join('/')
        : nameWithExtension
    }
  })
}
