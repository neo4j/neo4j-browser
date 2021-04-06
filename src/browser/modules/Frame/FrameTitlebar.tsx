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
import React, { useEffect, useRef, useState } from 'react'
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
  pin,
  remove,
  TRACK_COLLAPSE_TOGGLE,
  TRACK_FULLSCREEN_TOGGLE,
  TRACK_SAVE_AS_PROJECT_FILE,
  unpin
} from 'shared/modules/stream/streamDuck'
import { sleep } from 'shared/services/utils'
import { FrameButton } from 'browser-components/buttons'
import {
  CloseIcon,
  ContractIcon,
  DownIcon,
  ExpandIcon,
  PinIcon,
  RunIcon,
  UpIcon,
  SaveFavoriteIcon,
  StopIcon
} from 'browser-components/icons/Icons'
import { DottedLineHover } from '../Stream/styled'
import {
  StyledFrameTitleBar,
  StyledFrameTitlebarButtonSection,
  FrameTitleEditorContainer,
  StyledFrameCommand
} from './styled'
import Monaco, { MonacoHandles } from '../Editor/Monaco'
import { Bus } from 'suber'
import { addFavorite } from 'shared/modules/favorites/favoritesDuck'
import { GlobalState } from 'shared/globalState'

type FrameTitleBarBaseProps = {
  frame: Frame
  fullscreen: boolean
  fullscreenToggle: () => void
  collapse: boolean
  collapseToggle: () => void
  isPinned: boolean
  bus: Bus
  ExportButton: JSX.Element
}

type FrameTitleBarProps = FrameTitleBarBaseProps & {
  request: BrowserRequest | null
  isRelateAvailable: boolean
  newFavorite: (cmd: string) => void
  newProjectFile: (cmd: string) => void
  cancelQuery: (requestId: string) => void
  onCloseClick: (
    frameId: string,
    requestId: string,
    request: BrowserRequest | null
  ) => void
  reRun: (obj: Frame, cmd: string) => void
  togglePinning: (id: string, isPinned: boolean) => void
  onTitlebarClick: (cmd: string) => void
  trackFullscreenToggle: () => void
  trackCollapseToggle: () => void
}

function FrameTitlebar(props: FrameTitleBarProps) {
  const frame = props.frame
  const [editorValue, setEditorValue] = useState(frame.cmd)
  const [renderEditor, setRenderEditor] = useState(frame.isRerun)
  useEffect(() => {
    // makes sure the frame is updated as links in frame is followed
    editorRef.current?.setValue(props.frame.cmd)
  }, [props.frame.cmd])
  const editorRef = useRef<MonacoHandles>(null)

  function run(cmd: string) {
    props.reRun(frame, cmd)
  }

  const fullscreenIcon = props.fullscreen ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = props.collapse ? <DownIcon /> : <UpIcon />
  // the last run command (history index 1) is already in the editor
  // don't show it as history as well
  const history = (frame.history || []).slice(1)
  return (
    <StyledFrameTitleBar>
      {renderEditor ? (
        <FrameTitleEditorContainer data-testid="frameCommand">
          <Monaco
            history={history}
            useDb={frame.useDb}
            enableMultiStatementMode={true}
            id={`editor-${frame.id}`}
            bus={props.bus}
            onChange={setEditorValue}
            onExecute={run}
            value={editorValue}
            ref={editorRef}
            toggleFullscreen={props.fullscreenToggle}
          />
        </FrameTitleEditorContainer>
      ) : (
        <StyledFrameCommand
          selectedDb={frame.useDb}
          onClick={() => setRenderEditor(true)}
          data-testid="frameCommand"
        >
          <DottedLineHover>{editorValue.split('\n').join(' ')}</DottedLineHover>
        </StyledFrameCommand>
      )}
      <StyledFrameTitlebarButtonSection>
        <FrameButton
          data-testid="rerunFrameButton"
          title="Rerun"
          onClick={() =>
            props.request?.status === REQUEST_STATUS_PENDING
              ? props.cancelQuery(frame.requestId)
              : run(editorValue)
          }
        >
          {props.request?.status === REQUEST_STATUS_PENDING ? (
            <StopIcon />
          ) : (
            <RunIcon />
          )}
        </FrameButton>
        <FrameButton
          title="Save as Favorite"
          data-testid="frame-Favorite"
          onClick={() => {
            props.newFavorite(frame.cmd)
          }}
        >
          <SaveFavoriteIcon />
        </FrameButton>
        {props.ExportButton}
        <FrameButton
          title="Pin at top"
          onClick={() => {
            props.togglePinning(frame.id, props.isPinned)
          }}
          pressed={props.isPinned}
        >
          <PinIcon />
        </FrameButton>
        <FrameButton
          title={props.fullscreen ? 'Close fullscreen' : 'Fullscreen'}
          onClick={() => {
            props.fullscreenToggle()
            props.trackFullscreenToggle()
          }}
        >
          {fullscreenIcon}
        </FrameButton>
        <FrameButton
          title={props.collapse ? 'Expand' : 'Collapse'}
          onClick={() => {
            props.collapseToggle()
            props.trackCollapseToggle()
            if (!props.collapse) {
              setRenderEditor(false)
            }
          }}
        >
          {expandCollapseIcon}
        </FrameButton>
        <FrameButton
          title="Close"
          onClick={() => {
            props.onCloseClick(frame.id, frame.requestId, props.request)
          }}
        >
          <CloseIcon />
        </FrameButton>
      </StyledFrameTitlebarButtonSection>
    </StyledFrameTitleBar>
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
    isRelateAvailable: app.isRelateAvailable(state)
  }
}

const mapDispatchToProps = (
  dispatch: any,
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
    trackFullscreenToggle: () => {
      dispatch({ type: TRACK_FULLSCREEN_TOGGLE })
    },
    trackCollapseToggle: () => {
      dispatch({ type: TRACK_COLLAPSE_TOGGLE })
    },
    cancelQuery: (requestId: string) => {
      dispatch(cancelRequest(requestId))
    },
    onCloseClick: async (
      id: string,
      requestId: string,
      request: BrowserRequest | null
    ) => {
      if (request && request.status === REQUEST_STATUS_PENDING) {
        dispatch(cancelRequest(requestId))
        await sleep(3000) // sleep for 3000 ms to let user read the cancel info
      }
      dispatch(remove(id))
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
    togglePinning: (id: string, isPinned: boolean) => {
      isPinned ? dispatch(unpin(id)) : dispatch(pin(id))
    },
    onTitlebarClick: (cmd: string) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(FrameTitlebar)
)
