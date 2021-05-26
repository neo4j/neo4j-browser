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

import React from 'react'
import { connect } from 'react-redux'

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
  UpIcon
} from 'browser-components/icons/Icons'
import styled from 'styled-components'
import { GlobalState } from 'shared/globalState'
import { Action, Dispatch } from 'redux'

type FrameTitleBarBaseProps = {
  frame: Frame
  fullscreen: boolean
  fullscreenToggle: () => void
  collapse: boolean
  collapseToggle: () => void
  pinned: boolean
  togglePin: () => void
}

type FrameTitleBarProps = FrameTitleBarBaseProps & {
  onCloseClick: () => void
  togglePinning: (id: string, isPinned: boolean) => void
  trackFullscreenToggle: () => void
  trackCollapseToggle: () => void
}

function FrameTitlebar({
  frame,
  fullscreen,
  fullscreenToggle,
  collapse,
  collapseToggle,
  pinned,
  togglePin,
  onCloseClick,
  togglePinning,
  trackFullscreenToggle,
  trackCollapseToggle
}: FrameTitleBarProps) {
  const fullscreenIcon = fullscreen ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = collapse ? <DownIcon /> : <UpIcon />
  const TitleBarHeader = styled.div`
    display: flex;
    justify-content: flex-end;
    background-color: ${props => props.theme.secondaryBackground};
    border-radius: 2px 2px 0 0;
  `

  return (
    <TitleBarHeader>
      <FrameButton
        title="Pin at top"
        onClick={() => {
          togglePin()
          // using frame.isPinned causes issues when there are multiple frames in one
          togglePinning(frame.id, pinned)
        }}
        pressed={pinned}
      >
        <PinIcon />
      </FrameButton>
      <FrameButton
        title={collapse ? 'Expand' : 'Collapse'}
        onClick={() => {
          collapseToggle()
          trackCollapseToggle()
        }}
      >
        {expandCollapseIcon}
      </FrameButton>
      <FrameButton
        title={fullscreen ? 'Close fullscreen' : 'Fullscreen'}
        onClick={() => {
          fullscreenToggle()
          trackFullscreenToggle()
        }}
      >
        {fullscreenIcon}
      </FrameButton>
      <FrameButton title="Close" onClick={onCloseClick}>
        <CloseIcon />
      </FrameButton>
    </TitleBarHeader>
  )
}

type StateProps = {
  request: BrowserRequest | null
}
const mapStateToProps = (
  state: GlobalState,
  ownProps: FrameTitleBarBaseProps
): StateProps => ({
  request: ownProps.frame.requestId
    ? getRequest(state, ownProps.frame.requestId)
    : null
})

type DispatchProps = {
  togglePinning: (id: string, isPinned: boolean) => void
  trackFullscreenToggle: () => void
  trackCollapseToggle: () => void
  closeAndCancelRequest: (request: BrowserRequest | null) => Promise<void>
}
const mapDispatchToProps = (
  dispatch: Dispatch<Action>,
  ownProps: FrameTitleBarBaseProps
): DispatchProps => ({
  trackFullscreenToggle: () => {
    dispatch({ type: TRACK_FULLSCREEN_TOGGLE })
  },
  trackCollapseToggle: () => {
    dispatch({ type: TRACK_COLLAPSE_TOGGLE })
  },
  closeAndCancelRequest: async (request: BrowserRequest | null) => {
    if (request && request.status === REQUEST_STATUS_PENDING) {
      dispatch(cancelRequest(ownProps.frame.requestId))
      await sleep(3000) // sleep for 3000 ms to let user read the cancel info
    }
    dispatch(remove(ownProps.frame.id))
  },
  togglePinning: (id: string, isPinned: boolean) => {
    isPinned ? dispatch(unpin(id)) : dispatch(pin(id))
  }
})

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: FrameTitleBarBaseProps
) => ({
  ...stateProps,
  ...dispatchProps,
  onCloseClick: () => {
    dispatchProps.closeAndCancelRequest(stateProps.request)
  },
  ...ownProps
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FrameTitlebar)
