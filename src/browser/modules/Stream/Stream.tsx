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
import React, { memo, useRef, useEffect, useState } from 'react'
import {
  StyledStream,
  Padding,
  AnimationContainer,
  DropdownButton,
  DropdownList,
  DropdownContent,
  DropDownItemDivider
} from './styled'
import CypherFrame from './CypherFrame/CypherFrame'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import DefaultFrame from '../Frame/DefaultFrame'
import PreFrame from './PreFrame'
import ParamsFrame from './ParamsFrame'
import ErrorFrame from './ErrorFrame'
import HelpFrame from './HelpFrame'
import CypherScriptFrame from './CypherScriptFrame/CypherScriptFrame'
import SchemaFrame from './SchemaFrame'
import StyleFrame from './StyleFrame'
import SysInfoFrame from './SysInfoFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import ServerStatusFrame from './Auth/ServerStatusFrame'
import ServerSwitchFrame from './Auth/ServerSwitchFrame'
import UseDbFrame from './Auth/UseDbFrame'
import ChangePasswordFrame from './Auth/ChangePasswordFrame'
import QueriesFrame from './Queries/QueriesFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import { GlobalState } from 'shared/globalState'
import { FrameStack, Frame, getFrames } from 'shared/modules/stream/streamDuck'
import {
  getActiveConnectionData,
  Connection
} from 'shared/modules/connections/connectionsDuck'
import { getScrollToTop } from 'shared/modules/settings/settingsDuck'
import DbsFrame from './Auth/DbsFrame'
import { StyledFrame } from '../Frame/styled'
import FrameTitlebar from '../Frame/FrameTitlebar'
import { dim } from 'browser-styles/constants'
import styled from 'styled-components'
import { DownloadIcon } from 'browser-components/icons/Icons'
import { DropdownItem } from 'semantic-ui-react'

const trans: Record<string, React.ComponentType<any>> = {
  error: ErrorFrame,
  cypher: CypherFrame,
  'cypher-script': CypherScriptFrame,
  'user-list': UserList,
  'user-add': UserAdd,
  'change-password': ChangePasswordFrame,
  pre: PreFrame,
  play: PlayFrame,
  'play-remote': PlayFrame,
  history: HistoryFrame,
  param: ParamsFrame,
  params: ParamsFrame,
  connection: ConnectionFrame,
  disconnect: DisconnectFrame,
  schema: SchemaFrame,
  help: HelpFrame,
  queries: QueriesFrame,
  sysinfo: SysInfoFrame,
  status: ServerStatusFrame,
  'switch-success': ServerSwitchFrame,
  'switch-fail': ServerSwitchFrame,
  'use-db': UseDbFrame,
  'reset-db': UseDbFrame,
  dbs: DbsFrame,
  style: StyleFrame,
  default: DefaultFrame
}

const getFrameComponent = (frameData: FrameStack): React.ComponentType<any> => {
  const { cmd, type } = frameData.stack[0]
  let MyFrame = trans[type] || trans.default

  if (type === 'error') {
    try {
      const command = cmd.replace(/^:/, '')
      const Frame = command[0].toUpperCase() + command.slice(1) + 'Frame'
      MyFrame = require('./Extras/index')[Frame] || trans['error']
    } catch (e) {}
  }
  return MyFrame
}

type StreamProps = {
  frames: FrameStack[]
  activeConnectionData: Connection | null
  shouldScrollToTop: boolean
}

export interface BaseFrameProps {
  frame: Frame
  activeConnectionData: Connection | null
  stack: Frame[]
  setExportItems: (exportItems: ExportItem[]) => void
}

function Stream(props: StreamProps): JSX.Element {
  const base = useRef<HTMLDivElement>(null)
  const lastFrameCount = useRef(0)

  useEffect(() => {
    // If we want to scroll to top when a new frame is added
    if (
      lastFrameCount.current < props.frames.length &&
      props.shouldScrollToTop &&
      base.current
    ) {
      base.current.scrollTop = 0
    }

    lastFrameCount.current = props.frames.length
  })

  return (
    <StyledStream ref={base} data-testid="stream">
      {props.frames.map(frameObject => (
        <AnimationContainer key={frameObject.stack[0].id}>
          <FrameContainer
            frameData={frameObject}
            activeConnectionData={props.activeConnectionData}
          />
        </AnimationContainer>
      ))}
      <Padding />
    </StyledStream>
  )
}

type FrameContainerProps = {
  frameData: FrameStack
  activeConnectionData: Connection | null
}

function FrameContainer(props: FrameContainerProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    isCollapsed,
    toggleCollapse
  } = useSizeToggles()
  const frame = props.frameData.stack[0]
  const [exportItems, setExportItems] = useState<ExportItem[]>([])
  const frameProps: BaseFrameProps = {
    frame,
    activeConnectionData: props.activeConnectionData,
    stack: props.frameData.stack,
    setExportItems: a => {
      console.log(a)
      setExportItems(a)
    }
  }
  const CYPHERFRAMEBOTTOMPADDING = 40
  const FrameComponent = getFrameComponent(props.frameData)
  const frameContentElementRef = useRef<HTMLDivElement>(null)
  const [lastHeight, setLastHeight] = useState(470)

  useEffect(() => {
    if (!frameContentElementRef.current?.clientHeight) return
    const currHeight = frameContentElementRef.current.clientHeight
    if (currHeight < 300) return // No need to report a transition

    console.log('HERE', lastHeight, currHeight)
    if (lastHeight !== currHeight) {
      setLastHeight(currHeight)
    }
  }, [lastHeight, isFullscreen])

  return (
    <StyledFrame
      className={isFullscreen ? 'is-fullscreen' : ''}
      data-testid="frame"
      fullscreen={isFullscreen}
      ref={frameContentElementRef}
    >
      <FrameTitlebar
        frame={frame}
        isPinned={props.frameData.isPinned}
        fullscreen={isFullscreen}
        fullscreenToggle={toggleFullscreen}
        collapse={isCollapsed}
        collapseToggle={toggleCollapse}
        ExportButton={
          <ExportButton
            frame={frame}
            isRelateAvailable={false}
            newProjectFile={() => undefined}
            exportItems={exportItems}
          />
        }
      />
      <ContentContainer isCollapsed={isCollapsed} isFullscreen={isFullscreen}>
        <FrameComponent
          {...frameProps}
          frameHeight={lastHeight - CYPHERFRAMEBOTTOMPADDING}
        />
      </ContentContainer>
    </StyledFrame>
  )
}

type ExportButtonProps = {
  frame: Frame
  isRelateAvailable: boolean
  newProjectFile: (name: string) => void
  exportItems?: ExportItem[]
}

export type ExportItem = { name: string; download: () => void }

function ExportButton({
  frame,
  isRelateAvailable,
  newProjectFile,
  exportItems = []
}: ExportButtonProps): JSX.Element | null {
  const canExport: boolean = exportItems.length > 0 || isRelateAvailable

  return canExport ? (
    <DropdownButton data-testid="frame-export-dropdown">
      <DownloadIcon />
      <DropdownList>
        <DropdownContent>
          {isRelateAvailable && (
            <>
              <DropdownItem onClick={() => newProjectFile(frame.cmd)}>
                Save as project file
              </DropdownItem>
              <DropDownItemDivider />
            </>
          )}

          {exportItems.map(({ name, download }) => (
            <DropdownItem
              data-testid={`export${name}Button`}
              onClick={download}
              key={name}
            >
              Export {name}
            </DropdownItem>
          ))}
        </DropdownContent>
      </DropdownList>
    </DropdownButton>
  ) : null
}
const ContentContainer = styled.div<{
  isCollapsed: boolean
  isFullscreen: boolean
}>`
  overflow: auto;
  display: flex;
  flex-direction: row;
  width: 100%;
  max-height: ${props => {
    if (props.isCollapsed) {
      return 0
    }
    if (props.isFullscreen) {
      return '100%'
    }
    return dim.frameBodyHeight - dim.frameStatusbarHeight + 1 + 'px'
  }};
`

function useSizeToggles() {
  const [isCollapsed, setCollapsed] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)

  function toggleCollapse() {
    setCollapsed(coll => !coll)
    setFullscreen(false)
  }

  function toggleFullscreen() {
    setFullscreen(full => !full)
    setCollapsed(false)
  }

  return {
    isCollapsed,
    isFullscreen,
    toggleCollapse,
    toggleFullscreen
  }
}

const mapStateToProps = (state: GlobalState) => ({
  frames: getFrames(state),
  activeConnectionData: getActiveConnectionData(state),
  shouldScrollToTop: getScrollToTop(state)
})

export default connect(mapStateToProps)(memo(Stream))
