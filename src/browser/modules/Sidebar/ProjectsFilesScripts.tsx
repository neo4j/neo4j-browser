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
import React from 'react'
import { useEffect, useState, Dispatch } from 'react'
import { Action } from 'redux'
import { withBus } from 'react-suber'
import { connect } from 'react-redux'
import MyScripts from 'browser/components/SavedScripts'
import { useQuery, useMutation, ApolloError } from '@apollo/client'
import { filter, size } from 'lodash-es'

import * as editor from 'shared/modules/editor/editorDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { DOT } from 'shared/services/export-favorites'
import {
  ProjectFilesQueryVars,
  ProjectFileMutationVars,
  mapProjectFileToFavorites,
  updateCacheRemoveProjectFile,
  createFilePath
} from './project-files.utils'
import {
  Favorite,
  ProjectFilesResult,
  ProjectFilesVariables,
  GET_PROJECT_FILES,
  DELETE_PROJECT_FILE,
  REMOVE_PROJECT_FILE,
  EXECUTE_COMMAND_ORIGIN,
  EXECUTE_COMMAND_ORIGINS
} from './project-files.constants'
import Render from 'browser-components/Render'
import { Bus } from 'suber'
import { StyledErrorListContainer } from './styled'

interface ProjectFilesError {
  apolloErrors: (ApolloError | undefined)[]
  errors?: string[]
}

export const ProjectFilesError = ({
  apolloErrors,
  errors
}: ProjectFilesError): JSX.Element => {
  const definedApolloErrors = filter(
    apolloErrors,
    apolloError => apolloError !== undefined
  )
  const definedErrors = filter(errors, error => error !== '')
  const ErrorsList = () => {
    let errorsList: JSX.Element[] = []
    if (size(definedErrors)) {
      errorsList = [
        ...errorsList,
        ...definedErrors.map((definedError, i) => (
          <span key={`${definedError}-${i}`}>{definedError}</span>
        ))
      ]
    }
    if (size(definedApolloErrors)) {
      definedApolloErrors.map((definedApolloError, j) => {
        if (definedApolloError?.graphQLErrors.length) {
          errorsList = [
            ...errorsList,
            ...definedApolloError.graphQLErrors.map(({ message }, k) => (
              <span key={`${message}-${j}-${k}`}>{message}</span>
            ))
          ]
        }
        if (definedApolloError?.networkError) {
          errorsList = [
            ...errorsList,
            <span key={j}>A network error has occurred.</span>
          ]
        }
      })
    }
    return errorsList
  }

  return (
    <Render if={size(definedApolloErrors) || size(definedErrors)}>
      <StyledErrorListContainer>{ErrorsList()}</StyledErrorListContainer>
    </Render>
  )
}

interface ProjectFilesScripts {
  bus: Bus
  onSelectScript: (favorite: Favorite) => void
  onExecScript: (favorite: Favorite) => void
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

function ProjectFilesScripts(props: ProjectFilesScripts): JSX.Element {
  const { data, error: getProjectFilesError, refetch } = useQuery<
    ProjectFilesResult,
    ProjectFilesVariables
  >(GET_PROJECT_FILES, {
    variables: ProjectFilesQueryVars(props.projectId)
  })
  const [removeFile, { error: removeProjectFileError }] = useMutation(
    DELETE_PROJECT_FILE
  )
  const [projectFiles, setProjectFiles] = useState<Favorite[]>([])

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
  }, [
    data,
    props.relateApiToken,
    props.neo4jDesktopGraphAppId,
    props.relateUrl
  ])

  useEffect(() => {
    if (data && refetch) {
      refetch()
    }
  }, [data, refetch])

  const myScriptsProps = {
    onExecScript: props.onExecScript,
    scripts: projectFiles,
    isProjectFiles: true,
    scriptsNamespace: DOT,
    title: 'Cypher files',
    onRemoveScript: async (favorite: Favorite) => {
      try {
        const { data } = await removeFile({
          variables: ProjectFileMutationVars(
            createFilePath([favorite.directory, favorite.name]),
            props.projectId
          ),
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
    },
    onSelectScript: (favorite: Favorite) => {
      const directory =
        favorite.path.length == 1 && favorite.path === DOT
          ? DOT
          : favorite.path.substring(1) // remove DOT from path

      props.bus.send(
        editor.EDIT_CONTENT,
        editor.editContent(favorite.id, favorite.contents, {
          directory,
          name: favorite.name,
          isProjectFile: true
        })
      )
    },
    onExportScripts: Function.prototype,
    onUpdateFolder: Function.prototype,
    onRemoveFolder: Function.prototype
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
    projectId: state.app.relateProjectId,
    relateApiToken: state.app.relateApiToken,
    neo4jDesktopGraphAppId: state.app.neo4jDesktopGraphAppId,
    relateUrl: state.app.relateUrl
  }
}

const mapFavoritesDispatchToProps = (
  dispatch: Dispatch<Action>,
  ownProps: { bus: Bus }
) => ({
  onExecScript: (favorite: Favorite) => {
    ownProps.bus.send(EXECUTE_COMMAND_ORIGIN, EXECUTE_COMMAND_ORIGINS.SIDEBAR)
    dispatch(
      executeCommand(favorite.contents, { source: commandSources.projectFile })
    )
  }
})

export default withBus(
  connect(
    mapFavoritesStateToProps,
    mapFavoritesDispatchToProps
  )(ProjectFilesScripts)
)
