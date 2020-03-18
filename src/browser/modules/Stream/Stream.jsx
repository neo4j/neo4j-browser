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

import { connect } from 'react-redux'
import React, { PureComponent } from 'react'
import { StyledStream } from './styled'

import CypherFrame from './CypherFrame/index'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import Frame from '../Frame/Frame'
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
import { getFrames } from 'shared/modules/stream/streamDuck'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import { getScrollToTop } from 'shared/modules/settings/settingsDuck'
import DbsFrame from './Auth/DbsFrame'
import { getLatestFromFrameStack } from './stream.utils'

const getFrame = type => {
  const trans = {
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
    default: Frame
  }
  return trans[type] || trans.default
}

class Stream extends PureComponent {
  componentDidMount() {
    this.base = React.createRef()
  }

  componentDidUpdate(prevProps) {
    // If we want to scroll to top when a new frame is added
    if (
      prevProps.frames.length < this.props.frames.length &&
      this.props.scrollToTop &&
      this.base &&
      this.base.current
    ) {
      this.base.current.scrollTop = 0
    }
  }

  render() {
    return (
      <StyledStream ref={this.base}>
        {this.props.frames.map(frameObject => {
          const frame = getLatestFromFrameStack(frameObject)
          const frameProps = {
            frame: { ...frame, isPinned: frameObject.isPinned },
            activeConnectionData: this.props.activeConnectionData,
            stack: frameObject.stack
          }
          let MyFrame = getFrame(frame.type)
          if (frame.type === 'error') {
            try {
              const cmd = frame.cmd.replace(/^:/, '')
              const Frame = cmd[0].toUpperCase() + cmd.slice(1) + 'Frame'
              MyFrame = require('./Extras/index.js')[Frame]
              if (!MyFrame) {
                MyFrame = getFrame(frame.type)
              }
            } catch (e) {}
          }
          return <MyFrame {...frameProps} key={frame.id} />
        })}
      </StyledStream>
    )
  }
}

const mapStateToProps = state => {
  const frames = getFrames(state)
  return {
    frames,
    activeConnectionData: getActiveConnectionData(state),
    scrollToTop: getScrollToTop(state)
  }
}

export default connect(mapStateToProps)(Stream)
