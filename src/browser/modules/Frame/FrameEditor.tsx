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

import { connect } from 'react-redux'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { withBus } from 'react-suber'

import * as app from 'shared/modules/app/appDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import * as sidebar from 'shared/modules/sidebar/sidebarDuck'
import * as editor from 'shared/modules/editor/editorDuck'
import {
  cancel as cancelRequest,
  getRequest,
  BrowserRequest,
  REQUEST_STATUS_PENDING
} from 'shared/modules/requests/requestsDuck'
import {
  Frame,
  TRACK_SAVE_AS_PROJECT_FILE
} from 'shared/modules/stream/streamDuck'
import { EditorButton, FrameButton } from 'browser-components/buttons'
import { SaveFavoriteIcon } from 'browser-components/icons/Icons'
import { DottedLineHover } from '../Stream/styled'
import {
  StyledFrameEditorContainer,
  StyledFrameTitlebarButtonSection,
  StyledFrameCommand
} from './styled'
import Monaco, { MonacoHandles } from '../Editor/Monaco'
import { Bus } from 'suber'
import { addFavorite } from 'shared/modules/favorites/favoritesDuck'
import { isMac } from '../App/keyboardShortcuts'
import { MAIN_WRAPPER_DOM_ID } from '../App/App'
import stopIcon from 'icons/stop-icon.svg'
import runIcon from 'icons/run-icon.svg'
import { EditorContainer, Header } from '../Editor/styled'
import ExportButton from './ExportButton'
import { GlobalState } from 'shared/globalState'
import { Action, Dispatch } from 'redux'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'

type FrameTitleBarBaseProps = {
  frame: Frame
  fullscreenToggle: () => void
  numRecords: number
  getRecords: () => any
  visElement: any
  bus: Bus
}

type FrameTitleBarProps = FrameTitleBarBaseProps & {
  request: BrowserRequest | null
  isRelateAvailable: boolean
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  newFavorite: (cmd: string) => void
  newProjectFile: (cmd: string) => void
  cancelQuery: (requestId: string) => void
  reRun: (obj: Frame, cmd: string) => void
  onTitlebarCmdClick: (cmd: string) => void
}

function FrameTitlebar({
  request,
  isRelateAvailable,
  codeFontLigatures,
  enableMultiStatementMode,
  newFavorite,
  newProjectFile,
  cancelQuery,
  reRun,
  onTitlebarCmdClick,
  frame,
  fullscreenToggle,
  numRecords,
  getRecords,
  visElement,
  bus
}: FrameTitleBarProps) {
  const [editorValue, setEditorValue] = useState(frame.cmd)
  const [renderEditor, setRenderEditor] = useState(frame.isRerun)

  useEffect(() => {
    // makes sure the frame is updated as links in frame is followed
    editorRef.current?.setValue(frame.cmd)
  }, [frame.cmd])
  const editorRef = useRef<MonacoHandles>(null)

  /* When the frametype is changed the titlebar is unmounted
  and replaced with a new instance. This means focus cursor position are lost.
  To regain editor focus we run an effect dependant on the isRerun prop.
  However, when the frame prop changes in some way the effect is retriggered
  although the "isRun" is still true. Use effect does not check for equality
  but instead re-runs the effect to take focus again. To prevent this
  we use the useCallback hook as well. As a best effort we set the cursor position
  to be at the end of the query.

  A better solution is to change the frame titlebar to reside outside of the 
  frame contents.
  */

  const gainFocusCallback = useCallback(() => {
    if (frame.isRerun) {
      editorRef.current?.focus()

      const lines = (editorRef.current?.getValue() || '').split('\n')
      const linesLength = lines.length
      editorRef.current?.setPosition({
        lineNumber: linesLength,
        column: lines[linesLength - 1].length + 1
      })
    }
  }, [frame.isRerun])
  useEffect(gainFocusCallback, [gainFocusCallback])

  function run(cmd: string) {
    reRun(frame, cmd)
  }

  function onPreviewClick(e: React.MouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      onTitlebarCmdClick(editorValue)
    } else {
      setRenderEditor(true)
    }
  }

  const titleBarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // We want clicks outside the frame itself, not just the titlebar.
    // Because of how the component tree is built (we don't have a
    // reference to the full frame body) we'd need to pass
    // a ref from each parent to avoid this dom traversal
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Element)) {
        return
      }
      const insideFrame = titleBarRef.current
        ?.closest('article')
        ?.contains(event.target)

      const insideMainWrapper = document
        .getElementById(MAIN_WRAPPER_DOM_ID)
        ?.contains(event.target)

      if (!insideFrame && insideMainWrapper) {
        // Monaco has a 300ms debounce on calling it's onChange
        // using this ref prevents us from losing the edits made in the
        // last 300ms before clicking
        const editorRefVal = editorRef.current?.getValue()
        if (editorRefVal && editorRefVal !== editorValue) {
          setEditorValue(editorRefVal)
        }
        setRenderEditor(false)
      }
    }

    document.addEventListener('mouseup', handleClickOutside)
    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  })

  useEffect(() => {
    if (renderEditor) {
      editorRef.current?.focus()

      // Jump cursor to end
      const lines = (editorRef.current?.getValue() || '').split('\n')
      const linesLength = lines.length
      editorRef.current?.setPosition({
        lineNumber: linesLength,
        column: lines[linesLength - 1].length + 1
      })
    }
  }, [renderEditor])

  // the last run command (history index 1) is already in the editor
  // don't show it as history as well
  const history = (frame.history || []).slice(1)

  return (
    <StyledFrameEditorContainer ref={titleBarRef}>
      <Header>
        {renderEditor ? (
          <EditorContainer onClick={onPreviewClick} data-testid="frameCommand">
            <Monaco
              history={history}
              useDb={frame.useDb}
              enableMultiStatementMode={enableMultiStatementMode}
              fontLigatures={codeFontLigatures}
              id={`editor-${frame.id}`}
              bus={bus}
              onChange={setEditorValue}
              onExecute={run}
              value={editorValue}
              ref={editorRef}
              toggleFullscreen={fullscreenToggle}
            />
          </EditorContainer>
        ) : (
          <StyledFrameCommand
            selectedDb={frame.useDb}
            onClick={onPreviewClick}
            data-testid="frameCommand"
            title={`${isMac ? 'Cmd' : 'Ctrl'}+click to copy to main editor`}
          >
            <DottedLineHover>
              {editorValue.split('\n').join(' ')}
            </DottedLineHover>
          </StyledFrameCommand>
        )}
        <EditorButton
          data-testid="rerunFrameButton"
          onClick={() =>
            request?.status === REQUEST_STATUS_PENDING
              ? cancelQuery(frame.requestId)
              : run(editorValue)
          }
          title="Rerun"
          icon={request?.status === REQUEST_STATUS_PENDING ? stopIcon : runIcon}
          width={16}
        />
      </Header>
      <StyledFrameTitlebarButtonSection>
        <FrameButton
          title="Save as Favorite"
          data-testid="frame-Favorite"
          onClick={() => {
            newFavorite(frame.cmd)
          }}
        >
          <SaveFavoriteIcon />
        </FrameButton>
        <ExportButton
          frame={frame}
          numRecords={numRecords}
          getRecords={getRecords}
          visElement={visElement}
          isRelateAvailable={isRelateAvailable}
          newProjectFile={newProjectFile}
        />
      </StyledFrameTitlebarButtonSection>
    </StyledFrameEditorContainer>
  )
}

const mapStateToProps = (
  state: GlobalState,
  ownProps: FrameTitleBarBaseProps
) => {
  const request = ownProps.frame.requestId
    ? getRequest(state, ownProps.frame.requestId)
    : null

  return {
    request,
    isRelateAvailable: app.isRelateAvailable(state),
    codeFontLigatures: codeFontLigatures(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state)
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch<Action>,
  ownProps: FrameTitleBarBaseProps
) => {
  return {
    newFavorite: (cmd: string) => {
      dispatch(addFavorite(cmd))
      dispatch(sidebar.open('favorites'))
    },
    newProjectFile: (cmd: string) => {
      dispatch(sidebar.setDraftScript(cmd, 'project files'))
      dispatch({ type: TRACK_SAVE_AS_PROJECT_FILE })
    },
    cancelQuery: (requestId: string) => {
      dispatch(cancelRequest(requestId))
    },
    reRun: ({ useDb, id, requestId }: Frame, cmd: string) => {
      if (requestId) {
        dispatch(cancelRequest(requestId))
      }

      dispatch(
        commands.executeCommand(cmd, {
          id,
          useDb,
          isRerun: true,
          source: commands.commandSources.rerunFrame
        })
      )
    },
    onTitlebarCmdClick: (cmd: string) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(FrameTitlebar)
)
