/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Bus } from 'suber'
import { useMutation } from '@apollo/client'
import styled from 'styled-components'

import Render from 'browser-components/Render'
import { Drawer, DrawerHeader } from 'browser-components/drawer'
import ProjectFilesScripts, { ProjectFilesError } from './ProjectsFilesScripts'
import {
  setProjectFileDefaultFileName,
  updateCacheAddProjectFile
} from './project-files.utils'
import { SET_CONTENT } from 'shared/modules/editor/editorDuck'
import { CYPHER_FILE_EXTENSION } from 'shared/services/export-favorites'
import {
  SELECT_PROJECT_FILE,
  SAVE_PROJECT_FILE,
  ADD_PROJECT_FILE,
  PROJECT_FILES_MOUNTED,
  PROJECT_FILES_UNMOUNTED
} from './project-files.constants'

// @todo: Styled elements temporary until next set of work goes in
const StyledHeaderText = styled.div`
  font-family: 'Open Sans';
  color: white;
`

const StyledInputField = styled.input`
  height: 25px;
  width: 140px;
`

const StyledSubmitButton = styled.button`
  color: #fff;
  background-color: #428bca;
  border: none;
  border-radius: 3px;
  padding: 3px;
  font-weight: 500;
  font-size: 14px;
  height: 25px;
  margin: 5px 0 0 5px;
`

const StyledCancelButton = styled.button`
  color: #fff;
  background-color: #e74c3c;
  border: none;
  border-radius: 3px;
  padding: 3px;
  font-weight: 500;
  font-size: 14px;
  height: 25px;
  margin: 5px 0 0 5px;
`

const StyledSaveArea = styled.div`
  color: black;
  padding-left: 25px;
  margin-bottom: 20px;
`

interface ProjectFiles {
  bus: Bus
  projectId: string
}

const ProjectFiles = ({ bus, projectId }: ProjectFiles) => {
  const [addFile, { error: apolloError }] = useMutation(ADD_PROJECT_FILE)
  const [isSaveMode, setSaveMode] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContents, setFileContents] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isStillMounted = true
    // when ProjectFileButton is clicked in save mode
    bus &&
      bus.take(SAVE_PROJECT_FILE, editorValue => {
        if (isStillMounted) {
          setSaveMode(true)
          setFileName(setProjectFileDefaultFileName(editorValue))
          setFileContents(editorValue)
          setError('')
        }
      })
    // when a non-Project File action sets content in the editor
    bus &&
      bus.take(SET_CONTENT, () => {
        if (isStillMounted) {
          setSaveMode(false)
          setFileName('')
          setFileContents('')
          setError('')
        }
      })
    return () => {
      isStillMounted = false
    }
  }, [bus])

  useEffect(() => {
    // send mounted/unmounted message
    bus && bus.send(PROJECT_FILES_MOUNTED, '')
    return () => bus && bus.send(PROJECT_FILES_UNMOUNTED, '')
  }, [bus])

  return (
    <Drawer id="db-project-files">
      <DrawerHeader>Project Files</DrawerHeader>
      <Render if={isSaveMode}>
        <StyledSaveArea>
          <StyledHeaderText>Enter a file name</StyledHeaderText>
          <StyledInputField
            value={fileName}
            onChange={event => {
              setFileName(event.target.value)
            }}
          />
          <StyledSubmitButton
            onClick={async () => {
              if (!fileName.length) {
                setError('File name cannot be empty')
                return
              }
              // @todo: this needs more thought and extracting to a util
              if (
                fileName.includes('/') ||
                fileName.includes('\\') ||
                fileName.includes('..') ||
                fileName.startsWith('.') ||
                fileName.includes(':') // Windows
              ) {
                setError(
                  "File name cannot include /, \\, .., : or start with '.'"
                )
                return
              }
              if (fileName.length) {
                try {
                  const {
                    data: { addProjectFile }
                  } = await addFile({
                    variables: {
                      projectId,
                      fileUpload: new File(
                        [fileContents],
                        `${fileName}${CYPHER_FILE_EXTENSION}`
                      ) // no destination; only saving to Project root at this point
                    },
                    update: (cache, result) =>
                      updateCacheAddProjectFile(cache, result, projectId)
                  })
                  const addedFile = {
                    name: addProjectFile.name,
                    directory: addProjectFile.directory,
                    extension: addProjectFile.extension
                  }
                  setSaveMode(false)
                  setFileName('')
                  setFileContents('')
                  setError('')
                  bus.send(SELECT_PROJECT_FILE, addedFile) // set ProjectFileButton to edit mode
                } catch (e) {
                  console.log(e)
                }
              }
            }}
          >
            Save
          </StyledSubmitButton>
          <StyledCancelButton
            onClick={() => {
              setSaveMode(false)
              setError('')
            }}
          >
            Cancel
          </StyledCancelButton>
        </StyledSaveArea>
      </Render>
      <ProjectFilesError apolloErrors={[apolloError]} errors={[error]} />
      <ProjectFilesScripts />
    </Drawer>
  )
}

const mapStateToProps = (state: any) => {
  return {
    projectId: state.app.neo4jDesktopProjectId
  }
}

export default withBus(connect(mapStateToProps)(ProjectFiles))
