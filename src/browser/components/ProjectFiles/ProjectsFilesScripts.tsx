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
import { ApolloError, useMutation, useQuery } from '@apollo/client'
import { flatMap } from 'lodash-es'
import React from 'react'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Dispatch } from 'redux'
import { Bus } from 'suber'

import { StyledErrorListContainer } from '../../modules/Sidebar/styled'
import {
  DELETE_PROJECT_FILE,
  GET_PROJECT_FILES,
  ProjectFilesResult,
  ProjectFilesVariables,
  REMOVE_PROJECT_FILE
} from './projectFilesConstants'
import {
  ProjectFileMutationVars,
  ProjectFilesQueryVars,
  mapProjectFileToFavorites,
  updateCacheRemoveProjectFile
} from './projectFilesUtils'
import ProjectFileList, {
  ProjectFileScript
} from 'browser-components/ProjectFiles/ProjectFilesList'
import {
  ExecuteCommandAction,
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import * as editor from 'shared/modules/editor/editorDuck'

interface ProjectFilesError {
  apolloErrors: (ApolloError | undefined)[]
}

export const ProjectFilesError = ({
  apolloErrors
}: ProjectFilesError): JSX.Element => {
  const hasNetworkError = !!apolloErrors.find(error => error?.networkError)
  const graphQLErrors = flatMap(
    apolloErrors,
    error => error?.graphQLErrors.map(e => e.message) || []
  ).join('\n')

  return (
    <StyledErrorListContainer>
      {graphQLErrors && <div>{graphQLErrors}</div>}
      {hasNetworkError && <div>A network error has occurred</div>}
    </StyledErrorListContainer>
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
  const {
    data,
    error: getProjectFilesError,
    refetch
  } = useQuery<ProjectFilesResult, ProjectFilesVariables>(GET_PROJECT_FILES, {
    variables: ProjectFilesQueryVars(props.projectId)
  })
  const [removeFile, { error: removeProjectFileError }] =
    useMutation(DELETE_PROJECT_FILE)
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

  const ProjectFileListProps = {
    execScript: props.execScript,
    scripts: projectFiles,
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
          editor.editContent(script.filename, contents, {
            name: script.filename,
            isProjectFile: true
          })
        )
      )
    }
  }

  return (
    <>
      <ProjectFileList {...ProjectFileListProps} />
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

const mapDispatchToProps = (dispatch: Dispatch<ExecuteCommandAction>) => ({
  execScript: (cmd: string) => {
    dispatch(executeCommand(cmd, { source: commandSources.projectFile }))
  }
})

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(ProjectFilesScripts)
)
