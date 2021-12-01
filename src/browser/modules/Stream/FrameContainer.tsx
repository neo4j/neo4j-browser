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

import React, { useState } from 'react'
import { FrameStack } from 'shared/modules/frames/framesDuck'
import { Connection } from 'shared/modules/connections/connectionsDuck'
import { ContentContainer, StyledFrame } from '../Frame/styled'
import FrameTitlebar from '../Frame/FrameTitlebar'
import FrameEditor from '../Frame/FrameEditor'
import { BaseFrameProps } from './Stream'
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
import SysInfoFrame from './SysInfoFrame/SysInfoFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import ServerStatusFrame from './Auth/ServerStatusFrame'
import ServerSwitchFrame from './Auth/ServerSwitchFrame'
import UseDbFrame from './Auth/UseDbFrame'
import ChangePasswordFrame from './Auth/ChangePasswordFrame'
import QueriesFrame from './Queries/QueriesFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import DbsFrame from './Auth/DbsFrame'

// TODO type up these components
// TODO handle downloads
// TODO handle fullscreen better
const nameToFrame: Record<string, React.ComponentType<any>> = {
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
  let MyFrame = nameToFrame[type] || nameToFrame.default

  if (type === 'error') {
    try {
      const command = cmd.replace(/^:/, '')
      const Frame = command[0].toUpperCase() + command.slice(1) + 'Frame'
      MyFrame = require('./Extras/index')[Frame] || nameToFrame['error']
    } catch (e) {}
  }
  return MyFrame
}

type FrameContainerProps = {
  frameData: FrameStack
  activeConnectionData: Connection | null
}

export function FrameContainer(props: FrameContainerProps): JSX.Element {
  const {
    isFullscreen,
    toggleFullscreen,
    isCollapsed,
    toggleCollapse
  } = useSizeToggles()
  const frame = props.frameData.stack[0]
  const frameProps: BaseFrameProps = {
    frame: { ...frame, isPinned: props.frameData.isPinned },
    activeConnectionData: props.activeConnectionData,
    stack: props.frameData.stack,
    isFullscreen,
    isCollapsed
  }
  const FrameComponent = getFrameComponent(props.frameData)

  //className={classNames.join(' ')} // från komponenterna. kolla vilka som det är och hur man kan jobba runt
  return (
    <StyledFrame
      className={isFullscreen ? 'is-fullscreen' : ''}
      data-testid="frame"
      fullscreen={isFullscreen}
    >
      <FrameTitlebar
        frame={frame}
        pinned={props.frameData.isPinned}
        fullscreen={isFullscreen}
        fullscreenToggle={toggleFullscreen}
        collapse={isCollapsed}
        collapseToggle={toggleCollapse}
        togglePin={() => undefined}
      />
      <ContentContainer>
        <FrameEditor
          frame={frame}
          fullscreenToggle={toggleFullscreen}
          numRecords={0}
          getRecords={() => {}}
          visElement={null}
        />
        <FrameComponent
          {...frameProps}
          frameHeight={isFullscreen ? 'calc(100vh - 40px)' : '478px'}
        />
      </ContentContainer>
    </StyledFrame>
  )
}

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