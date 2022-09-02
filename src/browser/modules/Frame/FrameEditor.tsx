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
import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action, Dispatch } from 'redux'
import { Bus } from 'suber'

import { isMac } from 'neo4j-arc/common'
import {
  SaveFavoriteIcon,
  RunIcon,
  StopIcon
} from 'browser-components/icons/LegacyIcons'

import { MAIN_WRAPPER_DOM_ID } from '../App/App'
import { EditorContainer, Header } from '../Editor/styled'
import { DottedLineHover } from '../Stream/styled'
import ExportButton, { ExportItem } from './ExportButton'
import {
  StyledFrameCommand,
  StyledFrameEditorContainer,
  StyledFrameTitlebarButtonSection
} from './styled'
import { FrameButton, StyledEditorButton } from 'browser-components/buttons'
import { GlobalState } from 'shared/globalState'
import * as app from 'shared/modules/app/appDuck'
import * as commands from 'shared/modules/commands/commandsDuck'
import { applyParamGraphTypes } from 'shared/modules/commands/helpers/cypher'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import * as editor from 'shared/modules/editor/editorDuck'
import { addFavorite } from 'shared/modules/favorites/favoritesDuck'
import {
  Frame,
  TRACK_SAVE_AS_PROJECT_FILE
} from 'shared/modules/frames/framesDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import {
  BrowserRequest,
  REQUEST_STATUS_PENDING,
  cancel as cancelRequest,
  getRequest
} from 'shared/modules/requests/requestsDuck'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import * as sidebar from 'shared/modules/sidebar/sidebarDuck'
import { base, stopIconColor } from 'browser-styles/themes'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { QueryResult } from 'neo4j-driver'
import { CypherEditor } from 'neo4j-arc/cypher-language-support'

type FrameEditorBaseProps = {
  frame: Frame
  fullscreenToggle: () => void
  exportItems: ExportItem[]
  bus: Bus
  params: Record<string, unknown>
}

type FrameEditorProps = FrameEditorBaseProps & {
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

function FrameEditor({
  request,
  isRelateAvailable,
  codeFontLigatures,
  enableMultiStatementMode,
  newFavorite,
  newProjectFile,
  cancelQuery,
  reRun,
  frame,
  fullscreenToggle,
  exportItems,
  bus,
  params
}: FrameEditorProps) {
  const [editorValue, setEditorValue] = useState(frame.cmd)
  const [renderEditor, setRenderEditor] = useState(frame.isRerun)

  useEffect(() => {
    // makes sure the frame is updated as links in frame is followed
    editorRef.current?.setValue(frame.cmd)
  }, [frame.cmd])
  const editorRef = useRef<CypherEditor>(null)

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

  function onTitlebarCmdClick(cmd: string) {
    bus.send(editor.SET_CONTENT, editor.setContent(cmd))
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
            <CypherEditor
              enableMultiStatementMode={enableMultiStatementMode}
              fontLigatures={codeFontLigatures}
              history={history}
              id={`editor-${frame.id}`}
              isFullscreen={false}
              onChange={setEditorValue}
              onExecute={run}
              ref={editorRef}
              toggleFullscreen={fullscreenToggle}
              useDb={frame.useDb}
              value={editorValue}
              sendCypherQuery={(text: string) =>
                new Promise((res, rej) =>
                  bus.self(
                    CYPHER_REQUEST,
                    {
                      query: text,
                      queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
                      params: applyParamGraphTypes(params)
                    },
                    (response: { result: QueryResult; success?: boolean }) => {
                      if (response.success === true) {
                        res(response.result)
                      } else {
                        rej(response.result)
                      }
                    }
                  )
                )
              }
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
        {request?.status === REQUEST_STATUS_PENDING ? (
          <StyledEditorButton
            data-testid="stopRunFrameButton"
            onClick={() => cancelQuery(frame.requestId)}
            color={stopIconColor}
          >
            <StopIcon width={16} title={'Stop'} />
          </StyledEditorButton>
        ) : (
          <StyledEditorButton
            data-testid="rerunFrameButton"
            onClick={() => run(editorValue)}
            color={base.primary}
          >
            <RunIcon width={16} title={'Rerun'} />
          </StyledEditorButton>
        )}
      </Header>
      <StyledFrameTitlebarButtonSection>
        <FrameButton
          title="Save as Favorite"
          dataTestId="frame-Favorite"
          onClick={() => {
            newFavorite(frame.cmd)
          }}
        >
          <SaveFavoriteIcon />
        </FrameButton>
        <ExportButton
          frame={frame}
          exportItems={exportItems}
          isRelateAvailable={isRelateAvailable}
          newProjectFile={newProjectFile}
        />
      </StyledFrameTitlebarButtonSection>
    </StyledFrameEditorContainer>
  )
}

const mapStateToProps = (
  state: GlobalState,
  ownProps: FrameEditorBaseProps
) => {
  const request = ownProps.frame.requestId
    ? getRequest(state, ownProps.frame.requestId)
    : null

  return {
    request,
    isRelateAvailable: app.isRelateAvailable(state),
    codeFontLigatures: codeFontLigatures(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    params: getParams(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
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
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(FrameEditor)
)
