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

import { EditorButton } from 'browser-components/buttons'
import floppyDisk from 'icons/floppy-disk.svg'
import * as drawer from 'shared/modules/sidebar/sidebarDuck'
import { EDIT_CONTENT, SET_CONTENT } from 'shared/modules/editor/editorDuck'
import {
  ADD_PROJECT_FILE,
  SELECT_PROJECT_FILE,
  ProjectFile,
  SAVE_PROJECT_FILE,
  PROJECT_FILE_ERROR,
  EDIT_PROJECT_FILE_START,
  EDIT_PROJECT_FILE_END,
  PROJECT_FILES_MOUNTED,
  PROJECT_FILES_UNMOUNTED
} from 'browser/modules/Sidebar/project-files.constants'
import { useMutation } from '@apollo/client'
import { isWindows } from '../App/keyboardShortcuts'

const PROJECT_EDITOR_BUTTON_TITLE = 'Project File'
const PROJECT_SAVE_EDITOR_BUTTON_TITLE = 'Save Project File'
const PROJECT_EDIT_EDITOR_BUTTON_TITLE = 'Edit Project File'
const PROJECT_FILES_DRAWER_NAME = 'project files'

interface ProjectFilesButtonProps {
  width?: number
  editorValue: () => string
  bus: Bus
  toggleDrawer: () => void
  isDrawerOpen: boolean
  isRelateAvailable: boolean
  projectId: string
}

type ActiveRelateFile = Omit<ProjectFile, 'downloadToken'>

const ProjectFileButton = ({
  width = 24,
  editorValue,
  bus,
  toggleDrawer,
  isDrawerOpen,
  isRelateAvailable,
  projectId
}: ProjectFilesButtonProps): JSX.Element | null => {
  const [addFile, { error }] = useMutation(ADD_PROJECT_FILE)
  const [isEditMode, setEditMode] = useState(false)
  const [isSaveModeClick, setSaveModeClick] = useState(false)
  const [isProjectFilesMounted, setProjectFilesMounted] = useState(false)
  const [
    activeRelateFile,
    setActiveRelateFile
  ] = useState<ActiveRelateFile | null>(null)

  useEffect(() => {
    let isStillMounted = true

    // when a saved Project Script or Local Cache Script is clicked
    // not sure at this point which it could be
    bus &&
      bus.take(EDIT_CONTENT, () => {
        if (isStillMounted) {
          setEditMode(false)
          setActiveRelateFile(null)
        }
      })
    // only when a Project Script is clicked
    bus &&
      bus.take(SELECT_PROJECT_FILE, projectCypherFile => {
        if (isStillMounted) {
          setEditMode(true)
          setActiveRelateFile(projectCypherFile)
        }
      })
    // when a non-Project File action sets content in the editor
    bus &&
      bus.take(SET_CONTENT, () => {
        if (isStillMounted) {
          setEditMode(false)
          setActiveRelateFile(null)
        }
      })
    // Project Files is mounted
    bus &&
      bus.take(PROJECT_FILES_MOUNTED, () => {
        if (isStillMounted) {
          setProjectFilesMounted(true)
        }
      })
    // Prject Files is unmounted
    bus &&
      bus.take(PROJECT_FILES_UNMOUNTED, () => {
        if (isStillMounted) {
          setProjectFilesMounted(false)
        }
      })

    return () => {
      isStillMounted = false
    }
  }, [bus])

  useEffect(() => {
    // to report an error in the EditorFrame
    bus && bus.send(PROJECT_FILE_ERROR, '')
  }, [bus, error])

  useEffect(() => {
    // bus sends message too quickly before ProjectFiles is mounted,
    // so need to ensure ProjectsFile is mounted first.
    // isDrawerOpen is not reliable in this case.
    if (isSaveModeClick && isProjectFilesMounted) {
      bus.send(SAVE_PROJECT_FILE, editorValue())
      setSaveModeClick(false)
    }
  }, [bus, isSaveModeClick, isProjectFilesMounted])

  if (!isRelateAvailable) return null

  return (
    <EditorButton
      data-testid={`editor-${PROJECT_EDITOR_BUTTON_TITLE.split(' ')[0]}`}
      onClick={async () => {
        if (editorValue().length) {
          if (isEditMode && activeRelateFile) {
            // edit mode
            bus.send(EDIT_PROJECT_FILE_START, '') // display status in the EditorFrame
            try {
              const { data } = await addFile({
                variables: {
                  projectId,
                  fileUpload: new File([editorValue()], activeRelateFile.name),
                  destination: isWindows
                    ? `${activeRelateFile.directory}\\${activeRelateFile.name}`
                    : `${activeRelateFile.directory}/${activeRelateFile.name}`,
                  overwrite: true
                }
              })
              const addedFile = {
                name: data.addProjectFile.name,
                directory: data.addProjectFile.directory,
                extension: data.addProjectFile.extension
              }
              setActiveRelateFile(addedFile)
              setEditMode(true)
              bus.send(EDIT_PROJECT_FILE_END, '')
            } catch (e) {
              console.log(e)
            }
          } else {
            // save mode
            if (!isDrawerOpen) {
              toggleDrawer()
            }
            setSaveModeClick(true)
          }
        }
      }}
      title={
        isEditMode && activeRelateFile
          ? PROJECT_EDIT_EDITOR_BUTTON_TITLE
          : PROJECT_SAVE_EDITOR_BUTTON_TITLE
      }
      icon={floppyDisk}
      key={`editor${PROJECT_EDITOR_BUTTON_TITLE}`}
      width={width}
    />
  )
}

const mapStateToProps = (state: any) => {
  return {
    isDrawerOpen: state.drawer === PROJECT_FILES_DRAWER_NAME,
    // currently only Desktop specific
    isRelateAvailable:
      state.app.relateUrl &&
      state.app.relateApiToken &&
      state.app.neo4jDesktopProjectId,
    projectId: state.app.neo4jDesktopProjectId
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  toggleDrawer: () => dispatch(drawer.toggle(PROJECT_FILES_DRAWER_NAME))
})

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(ProjectFileButton)
)
