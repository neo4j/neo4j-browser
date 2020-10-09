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

import { gql } from '@apollo/client'

export const SELECT_PROJECT_FILE = 'SELECT_PROJECT_FILE'
export const SAVE_PROJECT_FILE = 'SAVE_PROJECT_FILE'
export const EDIT_PROJECT_FILE_START = 'EDIT_PROJECT_FILE_START'
export const EDIT_PROJECT_FILE_END = 'EDIT_PROJECT_FILE_END'
export const REMOVE_PROJECT_FILE = 'REMOVE_PROJECT_FILE'
export const PROJECT_FILE_ERROR = 'PROJECT_FILE_ERROR'
export const PROJECT_FILES_MOUNTED = 'PROJECT_FILES_MOUNTED'
export const PROJECT_FILES_UNMOUNTED = 'PROJECT_FILES_UNMOUNTED'

export interface AddProjectFile {
  addProjectFile: ProjectFile
}

export interface RemoveProjectFile {
  removeProjectFile: Omit<ProjectFile, 'downloadToken'>
}

export interface ProjectFile {
  downloadToken: string
  name: string
  directory: string
  extension: string
}

export interface ProjectFileMapping {
  downloadToken: string
  name: string
  directory: string
  apiToken: string
  clientId: string
  relateUrl: string
}

// needed for MyScripts component
export interface Favorite {
  id: string
  name: string
  path: string
  contents: string
  directory?: string
}

export interface ProjectFilesResult {
  getProject: { files: ProjectFile[] }
}

export interface ProjectFilesVariables {
  projectId: string
}

export const GET_PROJECT_FILES = gql`
  query GetProject($projectId: String!, $filterValue: String!) {
    getProject(name: $projectId) {
      files(
        filters: [{ field: "extension", type: EQUALS, value: $filterValue }]
      ) {
        name
        directory
        extension
        downloadToken
      }
    }
  }
`
export const DELETE_PROJECT_FILE = gql`
  mutation RemoveFile($projectId: String!, $filePath: String!) {
    removeProjectFile(name: $projectId, filePath: $filePath) {
      name
      directory
    }
  }
`
export const ADD_PROJECT_FILE = gql`
  mutation AddFile(
    $projectId: String!
    $fileUpload: Upload!
    $destination: String
    $overwrite: Boolean
  ) {
    addProjectFile(
      name: $projectId
      fileUpload: $fileUpload
      destination: $destination
      overwrite: $overwrite
    ) {
      name
      directory
      extension
      downloadToken
    }
  }
`
