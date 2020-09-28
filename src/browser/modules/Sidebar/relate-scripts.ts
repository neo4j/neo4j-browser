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

import { useEffect, useState } from 'react'
import { withBus } from 'react-suber'
import { connect } from 'react-redux'
import MyScripts from '@relate-by-ui/saved-scripts'
import { useQuery, gql, useMutation } from '@apollo/client'
import path from 'path'

import * as editor from 'shared/modules/editor/editorDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { SLASH } from 'shared/services/export-favorites'
import {
  getProjectFilesQueryVars,
  removeProjectFileMutationVars,
  mapRelateFavorites,
  ProjectFile,
  Favorite
} from './relate-scripts.utils'

const GET_PROJECT_FILES = gql`
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
const DELETE_PROJECT_FILE = gql`
  mutation RemoveFile($projectId: String!, $filePath: String!) {
    removeProjectFile(name: $projectId, filePath: $filePath) {
      name
      directory
    }
  }
`

interface ProjectFilesResult {
  getProject: { files: ProjectFile[] }
}

interface ProjectVariables {
  projectId: string
}

function RelateScripts(props: any): JSX.Element {
  // @todo: handling loading and error?? Pass to MyScripts??
  const { data, refetch } = useQuery<ProjectFilesResult, ProjectVariables>(
    GET_PROJECT_FILES,
    {
      variables: getProjectFilesQueryVars
    }
  )
  const [removeFavorite] = useMutation(DELETE_PROJECT_FILE)

  const [scripts, setScripts] = useState<Favorite[]>([])

  useEffect(() => {
    let isStillMounted = true
    if (data) {
      const getRelateFilePromises = data.getProject.files.map(
        mapRelateFavorites
      )
      Promise.all(getRelateFilePromises).then((files: Favorite[]) => {
        if (isStillMounted) {
          setScripts(files)
        }
      })
    }
    return () => {
      isStillMounted = false
    }
  }, [data])

  useEffect(() => {
    // refetch only once sidebar is closed once
    // i.e. 'data' is already present
    if (data && refetch) {
      refetch()
    }
  }, [])

  return MyScripts({
    ...props,
    scripts,
    isRelateScripts: true,
    onRemoveScript: favorite => {
      const directory = favorite.path.substring(1) // @todo: adding in SLASH to path
      const filePath = path.join(directory, favorite.name)
      return removeFavorite({
        variables: removeProjectFileMutationVars(filePath),
        update: (cache, { data: { removeProjectFile } }) => {
          const data = cache.readQuery<ProjectFilesResult>({
            query: GET_PROJECT_FILES,
            variables: getProjectFilesQueryVars
          })
          const filteredProjectFiles = data?.getProject.files.filter(
            file =>
              file.directory !== removeProjectFile.directory ||
              file.name !== removeProjectFile.name
          )
          cache.writeQuery({
            query: GET_PROJECT_FILES,
            data: {
              getProject: {
                files: filteredProjectFiles
              }
            },
            variables: getProjectFilesQueryVars
          })
        }
      })
    }
  })
}

const mapFavoritesStateToProps = () => {
  return {
    scriptsNamespace: SLASH,
    title: 'Project Scripts'
  }
}

const mapFavoritesDispatchToProps = (
  dispatch: any,
  ownProps: { bus: { send: any } }
) => ({
  onSelectScript: (favorite: any) =>
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.contents)
    ),
  onExecScript: (favorite: any) => dispatch(executeCommand(favorite.contents)),
  onExportScripts: Function.prototype,
  onUpdateFolder: Function.prototype,
  onRemoveFolder: Function.prototype
})

const mergeProps = (stateProps: any, dispatchProps: any) => {
  return {
    ...stateProps,
    ...dispatchProps
  }
}

export default withBus(
  connect(
    mapFavoritesStateToProps,
    mapFavoritesDispatchToProps,
    mergeProps
  )(RelateScripts)
)
