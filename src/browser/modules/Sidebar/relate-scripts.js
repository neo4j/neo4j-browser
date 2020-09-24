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

import React, { useEffect, useState, useRef } from 'react'
import { withBus } from 'react-suber'
import { connect } from 'react-redux'
import MyScripts from '@relate-by-ui/saved-scripts'
import { useQuery, gql, useMutation, NetworkStatus } from '@apollo/client'
import path from 'path'

import * as editor from 'shared/modules/editor/editorDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { SLASH } from 'shared/services/export-favorites'
import {
  getProjectFilesQueryVars,
  removeProjectFileMutationVars,
  mapRelateFavorites
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

const MyScriptsComponent = props => {
  // @todo: handling loading and error?? Pass to MyScripts??
  const { loading, error, data, refetch } = useQuery(GET_PROJECT_FILES, {
    variables: getProjectFilesQueryVars
  })
  const [removeFavorite] = useMutation(DELETE_PROJECT_FILE)

  const [scripts, setScripts] = useState([])
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    if (data) {
      // get cypher file contents
      const getRelateFilePromises = data.getProject.files.map(file =>
        mapRelateFavorites(file)
      )
      Promise.all(getRelateFilePromises).then(mappedRelateFiles => {
        if (isMountedRef.current) {
          setScripts([...mappedRelateFiles])
        }
      })
    }
    // cleanup to prevent setting state on unmounted component
    return () => (isMountedRef.current = false)
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
          const data = cache.readQuery({
            query: GET_PROJECT_FILES,
            variables: getProjectFilesQueryVars
          })
          const filteredProjectFiles = data.getProject.files.filter(
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

const mapFavoritesStateToProps = state => {
  return {
    scriptsNamespace: SLASH,
    title: 'Project Scripts'
  }
}
const mapFavoritesDispatchToProps = (dispatch, ownProps) => ({
  onSelectScript: favorite =>
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.contents)
    ),
  onExecScript: favorite => dispatch(executeCommand(favorite.contents)),
  onExportScripts: Function.prototype,
  onUpdateFolder: Function.prototype,
  onRemoveFolder: Function.prototype
})
const mergeProps = (stateProps, dispatchProps) => {
  return {
    ...stateProps,
    ...dispatchProps
  }
}
const RelateScripts = withBus(
  connect(
    mapFavoritesStateToProps,
    mapFavoritesDispatchToProps,
    mergeProps
  )(MyScriptsComponent)
)

export default RelateScripts
