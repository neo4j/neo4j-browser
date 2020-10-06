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
import { split, trim, head, startsWith } from 'lodash-es'
import {
  ApolloCache,
  FetchResult,
  NormalizedCacheObject,
  Reference
} from '@apollo/client'

import remote from 'services/remote'
import { SLASH, CYPHER_FILE_EXTENSION } from 'shared/services/export-favorites'
import {
  IProjectFile,
  IFavorite,
  IProjectFilesResult,
  GET_PROJECT_FILES,
  IAddProjectFile,
  IRemoveProjectFile,
  IProjectFileMapping
} from './project-files.constants'

export const ProjectFilesQueryVars = (
  projectId: string
): { projectId: string; filterValue: string } => ({
  projectId,
  filterValue: CYPHER_FILE_EXTENSION
})

export const ProjectFileMutationVars = (
  filePath: string,
  projectId: string
): { filePath: string; projectId: string } => ({
  projectId,
  filePath
})

export const mapProjectFileToFavorites = async ({
  downloadToken,
  name,
  directory,
  apiToken,
  clientId,
  relateUrl
}: IProjectFileMapping): Promise<IFavorite> => ({
  id: uuid.v4(),
  name,
  directory,
  path: directory.startsWith('.') ? SLASH : `${SLASH}${directory}`, // add SLASH to show files/folders
  contents: await getProjectFileContents(
    downloadToken,
    name,
    apiToken,
    clientId,
    relateUrl
  )
})

const getProjectFileContents = (
  token: string,
  name: string,
  apiToken: string,
  clientId: string,
  relateUrl: string
): Promise<any> =>
  remote
    .request('GET', `${relateUrl}/files/${token}/${name}`, null, {
      'X-API-Token': apiToken,
      'X-Client-Id': clientId
    })
    .then(body => body.text())
    .catch(e => console.log(`Unable to get file ${name}\n`, e))

const NEW_LINE = '\n'
const COMMENT_PREFIX = '//'

const isNonEmptyString = (toTest: string): boolean => {
  return Boolean(toTest)
}

// adapted from @relate-by-ui/saved-scripts utils
export const setProjectFileDefaultFileName = (contents: string): string => {
  const lines = split(contents, NEW_LINE)
  const firstLine = trim(head(lines) || '')

  if (!isNonEmptyString(firstLine)) {
    return ''
  }

  // remove comment lines and any forward or back slashes (replace with spaces)
  return startsWith(firstLine, COMMENT_PREFIX)
    ? trim(firstLine.slice(COMMENT_PREFIX.length)).replace(/\/|\\/g, ' ')
    : firstLine.replace(/\/|\\/g, ' ')
}

const readCacheQuery = (
  cache: ApolloCache<NormalizedCacheObject>,
  projectId: string
): IProjectFilesResult | null => {
  return cache.readQuery<IProjectFilesResult>({
    query: GET_PROJECT_FILES,
    variables: ProjectFilesQueryVars(projectId)
  })
}

const writeCacheQuery = (
  cache: ApolloCache<NormalizedCacheObject>,
  files: IProjectFile[],
  projectId: string
): Reference | undefined => {
  return cache.writeQuery({
    query: GET_PROJECT_FILES,
    data: {
      getProject: {
        files
      }
    },
    variables: ProjectFilesQueryVars(projectId)
  })
}

export const updateCacheRemoveProjectFile = (
  cache: ApolloCache<NormalizedCacheObject>,
  result: FetchResult<IRemoveProjectFile>,
  projectId: string
): void => {
  const data = readCacheQuery(cache, projectId)
  if (!data) {
    return
  }
  const filteredProjectFiles = data.getProject.files.filter(
    file =>
      file.directory !== result.data?.removeProjectFile.directory ||
      file.name !== result.data?.removeProjectFile.name
  )
  writeCacheQuery(cache, filteredProjectFiles, projectId)
}

export const updateCacheAddProjectFile = (
  cache: ApolloCache<NormalizedCacheObject>,
  result: FetchResult<IAddProjectFile>,
  projectId: string
): void => {
  const data = readCacheQuery(cache, projectId)
  if (!data || !result.data) {
    return
  }
  const currentProjectFiles = data.getProject?.files || []
  const updatedProjectFilesArray = [
    ...currentProjectFiles,
    result.data.addProjectFile
  ]
  writeCacheQuery(cache, updatedProjectFilesArray, projectId)
}
