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

import React from 'react'
import { connect } from 'react-redux'
import FrameTemplate from '../../Frame/FrameTemplate'
import {
  StyledConnectionAside,
  StyledConnectionBodyContainer,
  StyledConnectionBody
} from './styled'
import ConnectedView from './ConnectedView'
import { H3 } from 'browser-components/headers'
import Render from 'browser-components/Render'
import {
  getActiveConnectionData,
  getActiveConnection,
  isConnected
} from 'shared/modules/connections/connectionsDuck'
import { shouldRetainConnectionCredentials } from 'shared/modules/dbMeta/dbMetaDuck'
import { ClickToCode } from 'browser/modules/ClickToCode/index'

export const ServerStatusFrame = props => {
  const { activeConnectionData, storeCredentials, isConnected } = props

  return (
    <>
      <StyledConnectionAside>
        <span>
          <H3>Connection status</H3>
          This is your current connection information.
        </span>
      </StyledConnectionAside>
      <StyledConnectionBodyContainer>
        <Render if={!isConnected || !activeConnectionData}>
          <StyledConnectionBody>
            You are currently not connected to Neo4j.
            <br />
            Execute <ClickToCode>:server connect</ClickToCode> and enter your
            credentials to connect.
          </StyledConnectionBody>
        </Render>
        <Render
          if={
            isConnected &&
            activeConnectionData &&
            activeConnectionData.authEnabled
          }
        >
          <ConnectedView
            username={activeConnectionData && activeConnectionData.username}
            showHost
            host={activeConnectionData && activeConnectionData.host}
            storeCredentials={storeCredentials}
          />
        </Render>
        <Render
          if={
            isConnected &&
            activeConnectionData &&
            !activeConnectionData.authEnabled
          }
        >
          <StyledConnectionBody>
            You have a working connection and server auth is disabled.
          </StyledConnectionBody>
        </Render>
      </StyledConnectionBodyContainer>
    </>
  )
}

const Frame = props => {
  return (
    <FrameTemplate
      header={props.frame}
      contents={<ServerStatusFrame {...props} />}
    />
  )
}

const mapStateToProps = state => {
  return {
    activeConnection: getActiveConnection(state),
    activeConnectionData: getActiveConnectionData(state),
    storeCredentials: shouldRetainConnectionCredentials(state),
    isConnected: isConnected(state)
  }
}

export default connect(mapStateToProps, null)(Frame)
