/*
 * Copyright (c) 2002-2021 "Neo4j,"
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
import React, { memo, useRef, useEffect } from 'react'
import { StyledStream, Padding, AnimationContainer } from './styled'
import CypherFrame from './CypherFrame/index'
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
import { FrameStack, Frame, getFrames } from 'shared/modules/stream/streamDuck'
import {
  getActiveConnectionData,
  Connection
} from 'shared/modules/connections/connectionsDuck'
import { getScrollToTop } from 'shared/modules/settings/settingsDuck'
import DbsFrame from './Auth/DbsFrame'
import EditFrame from './EditFrame'
import { SnakeFrame } from './Extras/index'

const getFrame = (type: string) => {
  const trans: Record<string, any> = {
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
    edit: EditFrame,
    default: DefaultFrame
  }
  return trans[type] || trans.default
}

type StreamProps = {
  frames: FrameStack[]
  activeConnectionData: Connection | null
  shouldScrollToTop: boolean
}

export interface BaseFrameProps {
  frame: Frame & { isPinned: boolean }
  activeConnectionData: Connection | null
  stack: Frame[]
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
      {props.frames.map(frameObject => {
        const frame = frameObject.stack[0]

        const frameProps: BaseFrameProps = {
          frame: { ...frame, isPinned: frameObject.isPinned },
          activeConnectionData: props.activeConnectionData,
          stack: frameObject.stack
        }

        const MyFrame =
          frame.cmd.slice(1).toLowerCase() === 'snake'
            ? SnakeFrame
            : getFrame(frame.type)
        return (
          <AnimationContainer key={frame.id}>
            <MyFrame {...frameProps} />
          </AnimationContainer>
        )
      })}
      <Padding />
    </StyledStream>
  )
}

const mapStateToProps = (state: any) => ({
  frames: getFrames(state),
  activeConnectionData: getActiveConnectionData(state),
  shouldScrollToTop: getScrollToTop(state)
})

export default connect(mapStateToProps)(memo(Stream))
