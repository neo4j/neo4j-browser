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

import React, {
  useState,
  Dispatch,
  useEffect,
  useRef,
  useCallback
} from 'react'
import { Action } from 'redux'
import SVGInline from 'react-svg-inline'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { useMutation } from '@apollo/client'
import { withTheme } from 'styled-components'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  REMOVE_FAVORITE,
  updateFavorite
} from 'shared/modules/favorites/favoritesDuck'
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
  FOCUS,
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
import run_icon from 'icons/run_icon.svg'
import {
  ADD_PROJECT_FILE,
  REMOVE_PROJECT_FILE
} from 'browser/modules/Sidebar/project-files.constants'
import {
  setProjectFileDefaultFileName,
  createFilePath
} from 'browser/modules/Sidebar/project-files.utils'
import { defaultFavoriteName } from 'browser/modules/Sidebar/favorites.utils'
import Monaco, { MonacoHandles } from './Monaco'
import {
  getTheme,
  LIGHT_THEME,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'
import { BrowserTheme } from './CypherMonacoThemes'
import { getOpenDrawer } from 'shared/modules/sidebar/sidebarDuck'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'

type EditorFrameProps = {
  browserTheme: BrowserTheme
  bus: Bus
  drawer: string | null
  enableMultiStatementMode: boolean
  executeCommand: (cmd: string, source: string) => void
  projectId: string
  theme: { linkHover: string }
  updateFavorite: (id: string, value: string) => void
  useDb: null | string
}

type SavedScript = {
  content: string
  directory?: string
  id: string
  isProjectFile: boolean
  isStatic: boolean
  name?: string
}

export function EditorFrame({
  browserTheme,
  bus,
  drawer,
  enableMultiStatementMode,
  executeCommand,
  projectId,
  theme,
  updateFavorite,
  useDb
}: EditorFrameProps): JSX.Element {
  const [addFile] = useMutation(ADD_PROJECT_FILE)
  const [unsaved, setUnsaved] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)
  const [currentlyEditing, setCurrentlyEditing] = useState<SavedScript | null>(
    null
  )
  const editorRef = useRef<MonacoHandles>(null)
  const [lineCount, setLineCount] = useState(1)

  const toggleFullscreen = useCallback(() => {
    setFullscreen(!isFullscreen)
    editorRef.current?.resize(!isFullscreen)
  }, [isFullscreen])

  const [derivedTheme] = useDerivedTheme(browserTheme, LIGHT_THEME) as [
    BrowserTheme
  ]

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen), [
    bus,
    toggleFullscreen
  ])
  useEffect(
    () =>
      bus &&
      bus.take(REMOVE_FAVORITE, ({ id }) => {
        if (id === currentlyEditing?.id) {
          setCurrentlyEditing(null)
          editorRef.current?.setValue('')
        }
      }),
    [bus, currentlyEditing]
  )
  useEffect(
    () =>
      bus &&
      bus.take(REMOVE_PROJECT_FILE, ({ name }) => {
        if (name === currentlyEditing?.name) {
          setCurrentlyEditing(null)
          editorRef.current?.setValue('')
        }
      }),
    [bus, currentlyEditing]
  )

  useEffect(
    () =>
      bus &&
      bus.take(
        EDIT_CONTENT,
        ({ message, id, isProjectFile, name, directory, isStatic }) => {
          setUnsaved(false)
          setCurrentlyEditing({
            content: message,
            id,
            isProjectFile,
            name,
            directory,
            isStatic
          })
          editorRef.current?.setValue(message)
        }
      ),
    [bus]
  )

  useEffect(() => {
    bus.take(FOCUS, () => {
      editorRef.current?.focus()
    })
  }, [bus])

  useEffect(
    () =>
      bus &&
      bus.take(SET_CONTENT, ({ message }) => {
        setUnsaved(false)
        setCurrentlyEditing(null)
        editorRef.current?.setValue(message)
        editorRef.current?.resize(isFullscreen)
      }),
    [bus]
  )
  3
  function discardEditor() {
    editorRef.current?.setValue('')
    setCurrentlyEditing(null)
    setFullscreen(false)
    editorRef.current?.resize(false)
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

  const props = useSpring({
    opacity: currentlyEditing ? 1 : 0.5,
    height: currentlyEditing ? 'auto' : 0
  })

  function createRunCommandFunction(source: string) {
    return () => {
      executeCommand(editorRef.current?.getValue() || '', source)
      editorRef.current?.setValue('')
      setCurrentlyEditing(null)
      setFullscreen(false)
      editorRef.current?.resize(false)
    }
  }

  function getName({ name, content, isProjectFile }: SavedScript) {
    if (name) {
      return name
    }
    if (isProjectFile) {
      return setProjectFileDefaultFileName(content)
    }

    return defaultFavoriteName(content)
  }

  useEffect(() => {
    // After the sidebar animation has finished, the editor needs to resize its width
    setTimeout(() => editorRef.current?.resize(isFullscreen), 200)
  }, [lineCount, editorRef, drawer])

  const showUnsaved = !!(
    unsaved &&
    currentlyEditing &&
    !currentlyEditing?.isStatic
  )
  return (
    <Frame fullscreen={isFullscreen} data-testid="activeEditor">
      {currentlyEditing && (
        <animated.div style={props}>
          <ScriptTitle unsaved={showUnsaved}>
            <SVGInline
              svg={currentlyEditing.isProjectFile ? file : update_favorite}
              width="12px"
            />
            {currentlyEditing.isProjectFile ? ' Project file: ' : ' Favorite: '}
            {getName(currentlyEditing)}
            {showUnsaved ? '*' : ''}
            {currentlyEditing.isStatic ? ' (read-only)' : ''}
          </ScriptTitle>
        </animated.div>
      )}
      <FlexContainer>
        <Header>
          <EditorContainer>
            <Monaco
              bus={bus}
              enableMultiStatementMode={enableMultiStatementMode}
              id={'main-editor'}
              onChange={() => {
                setUnsaved(true)
              }}
              onChangeLineCount={count => {
                if (count !== lineCount) {
                  setLineCount(count)
                }
              }}
              onExecute={createRunCommandFunction(commandSources.editor)}
              ref={editorRef}
              theme={derivedTheme}
              useDb={useDb}
            />
          </EditorContainer>
          {currentlyEditing && !currentlyEditing.isStatic && (
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
                      destination: createFilePath([directory, name]),
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
            onClick={createRunCommandFunction(commandSources.playButton)}
            title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
            icon={run_icon}
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
  return {
    browserTheme: getTheme(state),
    drawer: getOpenDrawer(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    projectId: getProjectId(state),
    useDb: getUseDb(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    updateFavorite: (id: string, cmd: string) => {
      dispatch(updateFavorite(id, cmd))
    },
    executeCommand: (cmd: string, source: string) => {
      dispatch(executeCommand(cmd, { source }))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(withTheme(EditorFrame))
)
