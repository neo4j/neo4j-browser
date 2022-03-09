/*
 * Copyright (c) "Neo4j"
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
import { useMutation } from '@apollo/client'
import React, { Dispatch, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action } from 'redux'
import { Bus } from 'suber'

import {
  CloseIcon,
  ContractIcon,
  ExpandIcon,
  FavoriteIcon,
  FileIcon,
  isMac,
  UpdateFileIcon,
  RunIcon
} from 'common'

import Monaco, { MonacoHandles } from './Monaco'
import {
  CurrentEditIconContainer,
  EditorContainer,
  FlexContainer,
  Header,
  MainEditorWrapper,
  ScriptTitle
} from './styled'
import {
  ADD_PROJECT_FILE,
  REMOVE_PROJECT_FILE
} from 'browser-components/ProjectFiles/projectFilesConstants'
import { getProjectFileDefaultFileName } from 'browser-components/ProjectFiles/projectFilesUtils'
import { defaultNameFromDisplayContent } from 'browser-components/SavedScripts'
import { FrameButton, StyledEditorButton } from 'browser-components/buttons'
import {
  FULLSCREEN_SHORTCUT,
  printShortcut
} from 'browser/modules/App/keyboardShortcuts'
import { GlobalState } from 'shared/globalState'
import { getProjectId } from 'shared/modules/app/appDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'
import {
  EDIT_CONTENT,
  EXPAND,
  FOCUS,
  SET_CONTENT
} from 'shared/modules/editor/editorDuck'
import {
  REMOVE_FAVORITE,
  updateFavoriteContent
} from 'shared/modules/favorites/favoritesDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { base } from 'browser-styles/themes'

type EditorFrameProps = {
  bus: Bus
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  executeCommand: (cmd: string, source: string) => void
  history: string[]
  projectId: string
  updateFavorite: (id: string, value: string) => void
  useDb: null | string
  params: Record<string, unknown>
}

type SavedScript = {
  content: string
  directory?: string
  id: string
  isProjectFile: boolean
  isStatic: boolean
  name?: string
}

export function MainEditor({
  bus,
  codeFontLigatures,
  enableMultiStatementMode,
  executeCommand,
  history,
  projectId,
  updateFavorite,
  useDb,
  params
}: EditorFrameProps): JSX.Element {
  const [addFile] = useMutation(ADD_PROJECT_FILE)
  const [unsaved, setUnsaved] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)
  const [currentlyEditing, setCurrentlyEditing] = useState<SavedScript | null>(
    null
  )
  const editorRef = useRef<MonacoHandles>(null)

  const toggleFullscreen = () => {
    setFullscreen(fs => !fs)
  }

  useEffect(() => {
    editorRef.current?.resize(isFullscreen)
  }, [isFullscreen])

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen), [bus])
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
      }),
    [bus]
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

  function createRunCommandFunction(source: string) {
    return () => {
      executeCommand(editorRef.current?.getValue() || '', source)
      editorRef.current?.setValue('')
      setCurrentlyEditing(null)
      setFullscreen(false)
    }
  }

  function getName({ name, content, isProjectFile }: SavedScript) {
    if (name) {
      return name
    }
    if (isProjectFile) {
      return getProjectFileDefaultFileName(content)
    }

    return defaultNameFromDisplayContent(content)
  }

  const showUnsaved = !!(
    unsaved &&
    currentlyEditing &&
    !currentlyEditing?.isStatic
  )

  return (
    <MainEditorWrapper isFullscreen={isFullscreen} data-testid="activeEditor">
      {currentlyEditing && (
        <ScriptTitle data-testid="currentlyEditing" unsaved={showUnsaved}>
          {currentlyEditing.isProjectFile ? (
            <CurrentEditIconContainer>
              <FileIcon width={12} />
            </CurrentEditIconContainer>
          ) : (
            <CurrentEditIconContainer>
              <FavoriteIcon width={12} />
            </CurrentEditIconContainer>
          )}
          {currentlyEditing.isProjectFile ? ' Project file: ' : ' Favorite: '}
          {getName(currentlyEditing)}
          {showUnsaved ? '*' : ''}
          {currentlyEditing.isStatic ? ' (read-only)' : ''}
        </ScriptTitle>
      )}
      <FlexContainer>
        <Header>
          <EditorContainer>
            <Monaco
              bus={bus}
              enableMultiStatementMode={enableMultiStatementMode}
              history={history}
              isFullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
              id={'main-editor'}
              fontLigatures={codeFontLigatures}
              onChange={() => {
                setUnsaved(true)
              }}
              onDisplayHelpKeys={() =>
                executeCommand(':help keys', commandSources.editor)
              }
              onExecute={createRunCommandFunction(commandSources.editor)}
              ref={editorRef}
              useDb={useDb}
              params={params}
            />
          </EditorContainer>
          {currentlyEditing && !currentlyEditing.isStatic && (
            <StyledEditorButton
              data-testid="editor-Favorite"
              onClick={() => {
                setUnsaved(false)
                const editorValue = editorRef.current?.getValue() || ''

                const { isProjectFile, name } = currentlyEditing
                if (isProjectFile && name) {
                  addFile({
                    variables: {
                      projectId,
                      fileUpload: new File([editorValue], name),
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
            >
              {currentlyEditing.isProjectFile ? (
                <UpdateFileIcon width={16} title={'Update project file'} />
              ) : (
                <FavoriteIcon width={16} title={'Update favorite'} />
              )}
            </StyledEditorButton>
          )}
          <StyledEditorButton
            data-testid="editor-Run"
            onClick={createRunCommandFunction(commandSources.playButton)}
            key="editor-Run"
            color={base.primary}
          >
            <RunIcon
              width={16}
              title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
            />
          </StyledEditorButton>
        </Header>
        {buttons.map(({ onClick, icon, title, testId }) => (
          <FrameButton
            key={`frame-${title}`}
            title={title}
            onClick={onClick}
            dataTestId={`editor-${testId}`}
          >
            {icon}
          </FrameButton>
        ))}
      </FlexContainer>
    </MainEditorWrapper>
  )
}

const mapStateToProps = (state: GlobalState) => {
  return {
    codeFontLigatures: codeFontLigatures(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    history: getHistory(state),
    projectId: getProjectId(state),
    useDb: getUseDb(state),
    params: getParams(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    updateFavorite: (id: string, cmd: string) => {
      dispatch(updateFavoriteContent(id, cmd))
    },
    executeCommand: (cmd: string, source: string) => {
      dispatch(executeCommand(cmd, { source }))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(MainEditor))
