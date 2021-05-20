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

import React, { useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Frame } from 'shared/modules/stream/streamDuck'
import { isTouchScreen } from 'shared/modules/app/appDuck'
import { GlobalState } from 'shared/globalState'
import FrameTitlebar from './FrameTitlebar'

import {
  StyledFrame,
  StyledFrameBody,
  StyledFrameContents,
  StyledFrameStatusbar,
  StyledFrameMainSection,
  StyledFrameAside
} from './styled'

type FrameTemplateProps = {
  contents: JSX.Element | null | string
  header?: Frame
  className?: string
  onResize?: (fullscreen: boolean, collapsed: boolean, height: number) => void
  numRecords?: number
  getRecords?: () => any
  visElement?: any
  runQuery?: () => any
  sidebar?: () => JSX.Element | null
  aside?: JSX.Element | null
  statusbar?: JSX.Element | null
}

type FrameTemplateConnectedProps = FrameTemplateProps & {
  isTouchScreen: boolean
}

const noOp = () => {}

function _FrameTemplate({
  header,
  contents,
  onResize = () => {
    /*noop*/
  },
  className,
  numRecords = 0,
  getRecords,
  visElement,
  runQuery,
  sidebar,
  aside,
  statusbar
}: FrameTemplateConnectedProps): JSX.Element {
  const [lastRenderEditor, setLastRenderEditor] = useState(header?.isRerun)
  const [renderEditor, setRenderEditor] = useState(header?.isRerun)
  const [lastHeight, setLastHeight] = useState(10)
  // const [isMouseOver, setIsMouseOver] = useState(false)
  // const [isMouseOverBody, setIsMouseOverBody] = useState(false)
  const [touchShowButtons, setTouchShowButtons] = useState(false)
  const frameContentElementRef = useRef<any>(null)

  const isTouchScreen = 'A' === 'A'

  const {
    isFullscreen,
    isCollapsed,
    isPinned,
    toggleFullScreen,
    toggleCollapse,
    togglePin
  } = useSizeToggles()

  const showAllButtons: boolean = renderEditor ? touchShowButtons : true
  const toggleButtons = isTouchScreen
    ? () => setTouchShowButtons(mo => !mo)
    : noOp
  // const onContainerMouseEnter = isTouchScreen
  //   ? noOp
  //   : () => setIsMouseOver(true)
  // const onContainerMouseLeave = isTouchScreen
  //   ? noOp
  //   : () => setIsMouseOver(false)

  // const onBodyMouseEnter = isTouchScreen ? noOp : () => setIsMouseOverBody(true)
  // const onBodyMouseLeave = isTouchScreen
  //   ? noOp
  //   : () => setIsMouseOverBody(false)

  useEffect(() => {
    if (lastRenderEditor !== renderEditor) {
      setTouchShowButtons(!renderEditor)
    }
    setLastRenderEditor(renderEditor)
  }, [renderEditor])

  useEffect(() => {
    if (!frameContentElementRef.current?.clientHeight) return
    const currHeight = frameContentElementRef.current.clientHeight
    if (currHeight < 300) return // No need to report a transition

    if (lastHeight !== currHeight) {
      onResize(isFullscreen, isCollapsed, currHeight)
      setLastHeight(currHeight)
    }
  }, [lastHeight, isPinned, isFullscreen, isCollapsed, onResize])

  const classNames = []
  if (className) {
    classNames.push(className)
  }
  if (isFullscreen) {
    classNames.push('is-fullscreen')
  }

  return (
    <StyledFrame
      className={classNames.join(' ')}
      data-testid="frame"
      fullscreen={isFullscreen}
      // onMouseEnter={onContainerMouseEnter}
      // onMouseLeave={onContainerMouseLeave}
    >
      {header && (
        <FrameTitlebar
          showAllButtons={showAllButtons}
          overlayAllButtons={renderEditor}
          toggleButtons={toggleButtons}
          showToggleButtons={renderEditor}
          frame={header}
          renderEditor={renderEditor}
          setRenderEditor={setRenderEditor}
          fullscreen={isFullscreen}
          fullscreenToggle={toggleFullScreen}
          collapse={isCollapsed}
          collapseToggle={toggleCollapse}
          pinned={isPinned}
          togglePin={togglePin}
          numRecords={numRecords}
          getRecords={getRecords}
          visElement={visElement}
          runQuery={runQuery}
        />
      )}

      <StyledFrameBody
        fullscreen={isFullscreen}
        collapsed={isCollapsed}
        // onMouseEnter={onBodyMouseEnter}
        // onMouseLeave={onBodyMouseLeave}
      >
        {sidebar && sidebar()}
        {aside && <StyledFrameAside>{aside}</StyledFrameAside>}
        <StyledFrameMainSection>
          <StyledFrameContents
            fullscreen={isFullscreen}
            ref={frameContentElementRef}
            data-testid="frameContents"
          >
            {contents}
          </StyledFrameContents>
        </StyledFrameMainSection>
      </StyledFrameBody>

      {statusbar && (
        <StyledFrameStatusbar
          fullscreen={isFullscreen}
          data-testid="frameStatusbar"
        >
          {statusbar}
        </StyledFrameStatusbar>
      )}
    </StyledFrame>
  )
}

function useSizeToggles() {
  const [isFullscreen, setFullscreen] = useState(false)
  const [isCollapsed, setCollapsed] = useState(false)
  const [isPinned, setPinned] = useState(false)

  function toggleFullScreen() {
    setFullscreen(full => !full)
  }
  function toggleCollapse() {
    setCollapsed(coll => !coll)
  }
  function togglePin() {
    setPinned(pin => !pin)
  }
  return {
    isFullscreen,
    isCollapsed,
    isPinned,
    toggleFullScreen,
    toggleCollapse,
    togglePin
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isTouchScreen: isTouchScreen(state)
})

const FrameTemplate = connect(mapStateToProps)(_FrameTemplate)

export default FrameTemplate
