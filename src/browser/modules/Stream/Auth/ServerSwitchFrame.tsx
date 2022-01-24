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

import ClickToCode from '../../ClickToCode'
import FrameBodyTemplate from '../../Frame/FrameBodyTemplate'
import ConnectedView from './ConnectedView'
import {
  StyledConnectionAside,
  StyledConnectionBody,
  StyledConnectionBodyContainer
} from './styled'
import { H3 } from 'browser-components/headers'

const connectionFailed = (frame: any) => {
  return frame.type === 'switch-fail'
}

const connectionSuccess = (
  frame: any,
  activeConnectionData: any,
  dynamicConnectionData: any
) => {
  return (
    frame.type === 'switch-success' &&
    activeConnectionData &&
    dynamicConnectionData &&
    dynamicConnectionData.authEnabled
  )
}

export const ServerSwitchFrame = (props: any) => {
  const { frame, activeConnectionData: dynamicConnectionData = {} } = props
  const { activeConnectionData, storeCredentials } = frame
  return (
    <>
      <StyledConnectionAside>
        <span>
          {connectionFailed(frame) && (
            <>
              <H3>Connection failed</H3>
              Could not connect.
            </>
          )}
          {connectionSuccess(
            frame,
            activeConnectionData,
            dynamicConnectionData
          ) && (
            <>
              <H3>Connection updated</H3>
              You have switched connection.
            </>
          )}
        </span>
      </StyledConnectionAside>
      <StyledConnectionBodyContainer>
        {connectionFailed(frame) && (
          <StyledConnectionBody>
            The connection credentials provided could not be used to connect.
            <br />
            Do you have an active graph?
            <br />
            Execute <ClickToCode>:server connect</ClickToCode> to manually enter
            credentials if you have an active graph but the provided credentials
            were wrong.
          </StyledConnectionBody>
        )}
        {connectionSuccess(
          frame,
          activeConnectionData,
          dynamicConnectionData
        ) && (
          <ConnectedView
            host={activeConnectionData && activeConnectionData.host}
            username={activeConnectionData && activeConnectionData.username}
            showHost
            storeCredentials={storeCredentials}
          />
        )}
        {frame.type === 'switch-success' &&
          activeConnectionData &&
          dynamicConnectionData &&
          !dynamicConnectionData.authEnabled && (
            <div>
              <ConnectedView
                host={activeConnectionData && activeConnectionData.host}
                showHost
                hideStoreCredentials
                additionalFooter="You have a working connection with the Neo4j database and server auth is disabled."
              />
            </div>
          )}
      </StyledConnectionBodyContainer>
    </>
  )
}

const Frame = (props: any) => {
  return (
    <FrameBodyTemplate
      isCollapsed={props.isCollapsed}
      isFullscreen={props.isFullscreen}
      contents={<ServerSwitchFrame {...props} />}
    />
  )
}

export default Frame
