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

import {
  endsWith,
  filter,
  flatMap,
  join,
  last,
  map,
  replace,
  reverse,
  split,
  startsWith,
  tail,
  values
} from 'lodash-es'
import JSZip from 'jszip'
import {
  addScriptPathPrefix,
  getScriptDisplayName,
  omitScriptPathPrefix
} from '@relate-by-ui/saved-scripts'
import {
  BROWSER_FAVORITES_NAMESPACE,
  CYPHER_FILE_EXTENSION
} from 'shared/modules/userFavorites/user-favorites.constants'

/**
 * Extracts all .cypher files from a .zip archive and converts them to user scripts
 * @param     {File[]}                uploads uploaded .zip files
 * @return    {Promise<Object[]>}
 */
export async function readZipFiles (uploads) {
  const archives = await Promise.all(map(uploads, JSZip.loadAsync))
  const allFiles = flatMap(archives, ({ files }) => values(files))
  const onlyCypherFiles = filter(allFiles, ({ name }) =>
    endsWith(name, CYPHER_FILE_EXTENSION)
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
function fileContentToFavoriteFactory (file) {
  /**
   * Maps .zip archive file contents to a user script object
   * @param     {String}      contents    file contents
   * @return    {Object}                  user scripts object
   */
  return contents => {
    const pathWithLeadingSlash = startsWith(file.name, '/')
      ? file.name
      : `/${file.name}`
    const pathParts = split(
      omitScriptPathPrefix(BROWSER_FAVORITES_NAMESPACE, pathWithLeadingSlash),
      '/'
    )
    const name = replace(last(pathParts), CYPHER_FILE_EXTENSION, '')
    const path = addScriptPathPrefix(
      BROWSER_FAVORITES_NAMESPACE,
      join(reverse(tail(reverse(pathParts))), '/')
    )
    const displayName = getScriptDisplayName({ contents })

    if (name && name !== displayName) {
      return {
        name,
        path,
        contents
      }
    }

    return { contents, path }
  }
}
