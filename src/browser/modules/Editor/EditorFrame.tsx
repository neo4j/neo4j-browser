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

import React, { useState, Dispatch, useEffect, useRef } from 'react'
import { Action } from 'redux'
import SVGInline from 'react-svg-inline'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { useMutation } from '@apollo/client'
import { withTheme } from 'styled-components'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { updateFavorite } from 'shared/modules/favorites/favoritesDuck'
import { useSpring, animated } from 'react-spring'
import { Bus } from 'suber'
import {
  isMac,
  printShortcut,
  FULLSCREEN_SHORTCUT
} from 'browser/modules/App/keyboardShortcuts'
import { getProjectId } from 'shared/modules/app/appDuck'
import {
  EDIT_CONTENT,
  EXPAND,
  SET_CONTENT
} from 'shared/modules/editor/editorDuck'
import {
  Frame,
  Header,
  EditorContainer,
  FlexContainer,
  ScriptTitle
} from './styled'
import { EditorButton, FrameButton } from 'browser-components/buttons'
import {
  ExpandIcon,
  ContractIcon,
  CloseIcon
} from 'browser-components/icons/Icons'
import update_file from 'icons/update_file.svg'
import update_favorite from 'icons/update_favorite.svg'
import file from 'icons/file.svg'
import run from 'icons/run.svg'
import Editor from './Editor'
import { ADD_PROJECT_FILE } from 'browser/modules/Sidebar/project-files.constants'
import { isWindows } from '../App/keyboardShortcuts'
import { setProjectFileDefaultFileName } from 'browser/modules/Sidebar/project-files.utils'
function favoriteName(cmd: string) {
  const firstLine = cmd.split('\n')[0]

  if (firstLine.startsWith('//')) {
    return firstLine.slice(2)
  } else {
    return firstLine
  }
}

type EditorFrameProps = {
  bus: Bus
  theme: { linkHover: string }
  executeCommand: (cmd: string) => void
  updateFavorite: (id: string, value: string) => void
  projectId: string
}
type CodeEditor = {
  getValue: () => string | null
  setValue: (newText: string) => void
}

type SavedScript = {
  id: string
  content: string
  isProjectFile: boolean
  name?: string
  directory?: string
}

export function EditorFrame({
  bus,
  theme,
  executeCommand,
  updateFavorite,
  projectId
}: EditorFrameProps): JSX.Element {
  const [addFile] = useMutation(ADD_PROJECT_FILE)
  const [unsaved, setUnsaved] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)
  const [currentlyEditing, setCurrentlyEditing] = useState<SavedScript | null>(
    null
  )
  const editorRef = useRef<CodeEditor>(null)

  function toggleFullscreen() {
    setFullscreen(!isFullscreen)
  }

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen))
  useEffect(
    () =>
      bus &&
      bus.take(
        EDIT_CONTENT,
        ({ message, id, isProjectFile, name, directory }) => {
          setUnsaved(false)
          setCurrentlyEditing({
            content: message,
            id,
            isProjectFile,
            name,
            directory
          })
          editorRef.current?.setValue(message)
        }
      )
  )

  useEffect(
    () =>
      bus &&
      bus.take(SET_CONTENT, ({ message }) => {
        setUnsaved(false)
        setCurrentlyEditing(null)
        editorRef.current?.setValue(message)
      })
  )

  function discardEditor() {
    editorRef.current?.setValue('')
    setCurrentlyEditing(null)
    setFullscreen(false)
  }

  const buttons = [
    {
      onClick: toggleFullscreen,
      title: `${
        isFullscreen ? 'Close fullscreen ' : 'Fullscreen'
      } (${printShortcut(FULLSCREEN_SHORTCUT)})`,
      icon: isFullscreen ? <ContractIcon /> : <ExpandIcon />,
      testId: 'fullscreen'
    },
    {
      onClick: discardEditor,
      title: 'Close',
      icon: <CloseIcon />,
      testId: 'discard'
    }
  ]

  const TypedEditor: any = Editor // delete this when editor is ts
  const props = useSpring({
    opacity: currentlyEditing ? 1 : 0.5,
    height: currentlyEditing ? 'auto' : 0
  })

  function runCommand() {
    executeCommand(editorRef.current?.getValue() || '')
    editorRef.current?.setValue('')
    setCurrentlyEditing(null)
  }

  function getName({ name, content, isProjectFile }: SavedScript) {
    if (name) {
      return name
    }
    if (isProjectFile) {
      return setProjectFileDefaultFileName(content)
    }

    return favoriteName(content)
  }

  return (
    <Frame fullscreen={isFullscreen} data-testid="activeEditor">
      {currentlyEditing && (
        <animated.div style={props}>
          <ScriptTitle unsaved={unsaved}>
            <SVGInline
              svg={currentlyEditing.isProjectFile ? file : update_favorite}
              width="12px"
            />
            {currentlyEditing.isProjectFile ? ' Project file: ' : ' Favorite: '}
            {getName(currentlyEditing)}
            {unsaved ? '*' : ''}
          </ScriptTitle>
        </animated.div>
      )}
      <FlexContainer>
        <Header>
          <EditorContainer>
            <TypedEditor
              editorRef={editorRef}
              onChange={() => {
                setUnsaved(true)
              }}
              runCommand={runCommand}
            />
          </EditorContainer>
          {currentlyEditing && (
            <EditorButton
              data-testid="editor-Favorite"
              onClick={() => {
                setUnsaved(false)
                const editorValue = editorRef.current?.getValue() || ''

                const { isProjectFile, name, directory } = currentlyEditing
                if (isProjectFile && name && directory) {
                  addFile({
                    variables: {
                      projectId,
                      fileUpload: new File([editorValue], name),
                      destination: isWindows
                        ? `${directory}\\${name}`
                        : `${directory}/${name}`,
                      overwrite: true
                    }
                  })
                } else {
                  updateFavorite(currentlyEditing.id, editorValue)
                }
                setCurrentlyEditing({
                  ...currentlyEditing,
                  content: editorValue
                })
              }}
              key={'editor-Favorite'}
              title={`Update ${
                currentlyEditing.isProjectFile ? 'project file' : 'favorite'
              }`}
              icon={
                currentlyEditing.isProjectFile ? update_file : update_favorite
              }
              width={16}
            />
          )}
          <EditorButton
            data-testid="editor-Run"
            onClick={runCommand}
            title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
            icon={run}
            color={theme.linkHover}
            key="editor-Run"
            width={16}
          />
        </Header>
        {buttons.map(({ onClick, icon, title, testId }) => (
          <FrameButton
            key={`frame-${title}`}
            title={title}
            onClick={onClick}
            data-testid={`editor-${testId}`}
          >
            {icon}
          </FrameButton>
        ))}
      </FlexContainer>
    </Frame>
  )
}

const mapStateToProps = (state: any) => {
  return { projectId: getProjectId(state) }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    updateFavorite: (id: string, cmd: string) => {
      dispatch(updateFavorite(id, cmd))
    },
    executeCommand: (cmd: string) => {
      dispatch(executeCommand(cmd))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(withTheme(EditorFrame))
)
