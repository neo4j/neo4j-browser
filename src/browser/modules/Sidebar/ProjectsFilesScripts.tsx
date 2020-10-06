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
import React from 'react'
import { useEffect, useState } from 'react'
import { withBus } from 'react-suber'
import { connect } from 'react-redux'
import MyScripts from '@relate-by-ui/saved-scripts'
import { useQuery, useMutation, ApolloError } from '@apollo/client'
import path from 'path'
import { filter, size, omit } from 'lodash-es'

import * as editor from 'shared/modules/editor/editorDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { SLASH, CYPHER_FILE_EXTENSION } from 'shared/services/export-favorites'
import {
  ProjectFilesQueryVars,
  ProjectFileMutationVars,
  mapProjectFileToFavorites,
  updateCacheRemoveProjectFile
} from 'src-root/browser/modules/Sidebar/project-files.utils'
import {
  IFavorite,
  IProjectFilesResult,
  IProjectFilesVariables,
  SELECT_PROJECT_FILE,
  GET_PROJECT_FILES,
  DELETE_PROJECT_FILE,
  REMOVE_PROJECT_FILE
} from 'src-root/browser/modules/Sidebar/project-files.constants'
import Render from 'browser-components/Render'
import { Bus } from 'suber'

interface IProjectFilesError {
  apolloErrors: (ApolloError | undefined)[]
  errors?: string[]
}

export const ProjectFilesError = ({
  apolloErrors,
  errors
}: IProjectFilesError): JSX.Element => {
  const definedApolloErrors = filter(
    apolloErrors,
    apolloError => apolloError !== undefined
  )
  const definedErrors = filter(errors, error => error !== '')
  const ErrorsList = () => {
    if (size(definedErrors)) {
      return definedErrors.map((definedError, i) => (
        <span key={`${definedError}-${i}`}>{definedError}</span>
      ))
    }
    if (size(definedApolloErrors)) {
      return definedApolloErrors.map((definedApolloError, j) => {
        if (definedApolloError?.graphQLErrors.length) {
          return definedApolloError.graphQLErrors.map(({ message }, k) => (
            <span key={`${message}-${j}-${k}`}>{message}</span>
          ))
        }
        if (definedApolloError?.networkError) {
          return <span key={j}>A network error has occurred.</span>
        }
        return null
      })
    }
    return null
  }

  return (
    <Render if={size(definedApolloErrors) || size(definedErrors)}>
      {ErrorsList()}
    </Render>
  )
}

interface IProjectFilesScripts {
  bus: Bus
  onSelectScript: (favorite: IFavorite) => void
  onExecScript: (favorite: IFavorite) => void
  onExportScripts: () => void
  onUpdateFolder: () => void
  onRemoveFolder: () => void
  scriptsNamespace: string
  title: string
  projectId: string
  relateApiToken: string
  neo4jDesktopGraphAppId: string
  relateUrl: string
}

function ProjectFilesScripts(props: IProjectFilesScripts): JSX.Element {
  const { data, error: getProjectFilesError, refetch } = useQuery<
    IProjectFilesResult,
    IProjectFilesVariables
  >(GET_PROJECT_FILES, {
    variables: ProjectFilesQueryVars(props.projectId)
  })
  const [removeFile, { error: removeProjectFileError }] = useMutation(
    DELETE_PROJECT_FILE
  )
  const [projectFiles, setProjectFiles] = useState<IFavorite[]>([])

  useEffect(() => {
    let isStillMounted = true
    if (data) {
      const getProjectFiles = async () => {
        const getProjectFilePromises = data.getProject.files.map(
          ({ downloadToken, name, directory }) =>
            mapProjectFileToFavorites({
              downloadToken,
              name,
              directory,
              apiToken: props.relateApiToken,
              clientId: props.neo4jDesktopGraphAppId,
              relateUrl: props.relateUrl
            })
        )
        const projectFiles = await Promise.all(getProjectFilePromises)
        if (isStillMounted) {
          setProjectFiles(projectFiles)
        }
      }
      getProjectFiles()
    }
    return () => {
      isStillMounted = false
    }
  }, [data])

  useEffect(() => {
    if (data && refetch) {
      refetch()
    }
  }, [data, refetch])

  const myScriptsProps = {
    ...omit(props, [
      'bus',
      'projectId',
      'relateApiToken',
      'neo4jDesktopGraphAppId',
      'relateUrl'
    ]),
    scripts: projectFiles,
    isProjectFiles: true,
    onRemoveScript: async (favorite: IFavorite) => {
      const directory = favorite.path.substring(1) // remove SLASH from path
      const filePath = path.join(directory, favorite.name)
      try {
        const { data } = await removeFile({
          variables: ProjectFileMutationVars(filePath, props.projectId),
          update: (cache, result) =>
            updateCacheRemoveProjectFile(cache, result, props.projectId)
        })
        props.bus.send(REMOVE_PROJECT_FILE, {
          name: data.removeProjectFile.name,
          directory: data.removeProjectFile.directory,
          extension: data.removeProjectFile.extension
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
  return (
    <>
      <MyScripts {...myScriptsProps} />
      <ProjectFilesError
        apolloErrors={[getProjectFilesError, removeProjectFileError]}
      />
    </>
  )
}

const mapFavoritesStateToProps = (state: any) => {
  return {
    scriptsNamespace: SLASH,
    title: 'Project Files',
    projectId: state.app.neo4jDesktopProjectId,
    relateApiToken: state.app.relateApiToken,
    neo4jDesktopGraphAppId: state.app.neo4jDesktopGraphAppId,
    relateUrl: state.app.relateUrl
  }
}

const mapFavoritesDispatchToProps = (
  dispatch: any,
  ownProps: { bus: Bus }
) => ({
  onSelectScript: (favorite: IFavorite) => {
    ownProps.bus.send(
      editor.EDIT_CONTENT,
      editor.editContent(favorite.id, favorite.contents, true)
    )
    ownProps.bus.send(SELECT_PROJECT_FILE, {
      name: favorite.name,
      directory: favorite.directory,
      extension: CYPHER_FILE_EXTENSION
    })
  },
  bus: ownProps.bus,
  onExecScript: (favorite: IFavorite) =>
    dispatch(executeCommand(favorite.contents)),
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
  )(ProjectFilesScripts)
)
