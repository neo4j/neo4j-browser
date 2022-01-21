/*
 * Copyright (c) "Neo4j"
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
  ApolloCache,
  FetchResult,
  NormalizedCacheObject,
  Reference
} from '@apollo/client'

import {
  AddProjectFile,
  GET_PROJECT_FILES,
  ProjectFile,
  ProjectFileMapping,
  ProjectFilesResult,
  RemoveProjectFile
} from './projectFilesConstants'
import { ProjectFileScript } from 'browser-components/ProjectFiles/ProjectFilesList'
import { defaultNameFromDisplayContent } from 'browser-components/SavedScripts'
import { CYPHER_FILE_EXTENSION } from 'services/exporting/favoriteUtils'
import remote from 'services/remote'

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

export const mapProjectFileToFavorites = ({
  downloadToken,
  name,
  apiToken,
  clientId,
  relateUrl
}: ProjectFileMapping): ProjectFileScript => ({
  filename: name,
  content: getProjectFileContents(
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
): Promise<string> =>
  remote
    .request('GET', `${relateUrl}/files/${token}/${name}`, null, {
      'X-API-Token': apiToken,
      'X-Client-Id': clientId
    })
    .then(body => body.text())
    .catch(e => {
      console.log(`Unable to get file ${name}\n`, e)
      return ''
    })

export const getProjectFileDefaultFileName = (contents: string): string => {
  const defaultScriptName = defaultNameFromDisplayContent(contents)

  return defaultScriptName
    .replace(/\/|\\/g, '') // replace any forward or back slashes
    .replace(/[^\w]/g, '-') // replace any non-word chars with dashes
    .replace(/-+/g, '-') // replace 1 or more dashes with single dash
    .replace(/-$/, '') // remove dash from end of line
}

const readCacheQuery = (
  cache: ApolloCache<NormalizedCacheObject>,
  projectId: string
): ProjectFilesResult | null => {
  return cache.readQuery<ProjectFilesResult>({
    query: GET_PROJECT_FILES,
    variables: ProjectFilesQueryVars(projectId)
  })
}

const writeCacheQuery = (
  cache: ApolloCache<NormalizedCacheObject>,
  files: ProjectFile[],
  projectId: string
): Reference | undefined => {
  return cache.writeQuery({
    query: GET_PROJECT_FILES,
    data: {
      getProject: {
        id: projectId,
        files
      }
    },
    variables: ProjectFilesQueryVars(projectId)
  })
}

export const updateCacheRemoveProjectFile = (
  cache: ApolloCache<NormalizedCacheObject>,
  result: FetchResult<RemoveProjectFile>,
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
  result: FetchResult<AddProjectFile>,
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
