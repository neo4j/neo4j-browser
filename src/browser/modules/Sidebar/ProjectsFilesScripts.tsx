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
import { connect } from 'react-redux'
import { useQuery, useMutation, ApolloError } from '@apollo/client'
import { filter, size } from 'lodash-es'

import * as editor from 'shared/modules/editor/editorDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  ProjectFilesQueryVars,
  ProjectFileMutationVars,
  mapProjectFileToFavorites,
  updateCacheRemoveProjectFile
} from './projectFilesUtils'
import {
  ProjectFilesResult,
  ProjectFilesVariables,
  GET_PROJECT_FILES,
  DELETE_PROJECT_FILE,
  REMOVE_PROJECT_FILE
} from './projectFilesConstants'
import Render from 'browser-components/Render'
import { Bus } from 'suber'
import { StyledErrorListContainer } from './styled'
import { withBus } from 'react-suber'
import ProjectFileList, {
  ProjectFileScript
} from 'browser-components/SavedScripts/ProjectFilesList'

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
  selectScript: (script: ProjectFileScript) => void
  execScript: (cmd: string) => void
  exportScripts: () => void
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
  const [projectFiles, setProjectFiles] = useState<ProjectFileScript[]>([])

  useEffect(() => {
    if (data) {
      setProjectFiles(
        data.getProject.files.map(({ downloadToken, name, directory }) =>
          mapProjectFileToFavorites({
            downloadToken,
            name,
            directory,
            apiToken: props.relateApiToken,
            clientId: props.neo4jDesktopGraphAppId,
            relateUrl: props.relateUrl
          })
        )
      )
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
    execScript: props.execScript,
    scripts: projectFiles,
    title: 'Cypher files',
    removeScript: async (script: ProjectFileScript) => {
      try {
        const { data } = await removeFile({
          variables: ProjectFileMutationVars(script.filename, props.projectId),
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
    selectScript: (script: ProjectFileScript) => {
      script.content.then(contents =>
        props.bus.send(
          editor.EDIT_CONTENT,
          editor.editContent(script.id, contents, {
            name: script.filename
          })
        )
      )
    }
  }

  return (
    <>
      <ProjectFileList {...myScriptsProps} />
      <ProjectFilesError
        apolloErrors={[getProjectFilesError, removeProjectFileError]}
      />
    </>
  )
}

const mapStateToProps = (state: any) => ({
  projectId: state.app.relateProjectId,
  relateApiToken: state.app.relateApiToken,
  neo4jDesktopGraphAppId: state.app.neo4jDesktopGraphAppId,
  relateUrl: state.app.relateUrl
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  execScript: (cmd: string) => {
    dispatch(executeCommand(cmd, { source: commandSources.projectFile }))
  }
})

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(ProjectFilesScripts)
)
