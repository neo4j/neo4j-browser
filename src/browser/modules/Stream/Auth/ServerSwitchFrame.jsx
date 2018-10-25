/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import React, { Component } from 'react'
import FrameTemplate from '../FrameTemplate'
import {
  StyledConnectionFrame,
  StyledConnectionAside,
  StyledConnectionBodyContainer,
  StyledConnectionBody
} from './styled'
import ConnectedView from './ConnectedView'
import { H3 } from 'browser-components/headers'
import Render from 'browser-components/Render'
import ClickToCode from '../../ClickToCode'

const connectionFailed = frame => {
  return frame.type === 'switch-fail'
}

const connectionSuccess = (
  frame,
  activeConnectionData,
  dynamicConnectionData
) => {
  return (
    frame.type === 'switch-success' &&
    activeConnectionData &&
    dynamicConnectionData &&
    dynamicConnectionData.authEnabled
  )
}

export const ServerSwitchFrame = props => {
  const { frame, activeConnectionData: dynamicConnectionData = {} } = props
  const { activeConnectionData, storeCredentials } = frame
  return (
    <StyledConnectionFrame>
      <StyledConnectionAside>
        <span>
          <Render if={connectionFailed(frame)}>
            <React.Fragment>
              <H3>Connection failed</H3>
              Could not connect.
            </React.Fragment>
          </Render>
          <Render
            if={connectionSuccess(
              frame,
              activeConnectionData,
              dynamicConnectionData
            )}
          >
            <React.Fragment>
              <H3>Connection updated</H3>
              You have switched connection.
            </React.Fragment>
          </Render>
        </span>
      </StyledConnectionAside>
      <StyledConnectionBodyContainer>
        <Render if={connectionFailed(frame)}>
          <StyledConnectionBody>
            The connection credentials provided could not be used to connect.
            <br />
            Did you start a graph?
            <br />
            Execute <ClickToCode>:server connect</ClickToCode> to manually enter
            credentials if you have a graph running.
          </StyledConnectionBody>
        </Render>
        <Render
          if={connectionSuccess(
            frame,
            activeConnectionData,
            dynamicConnectionData
          )}
        >
          <ConnectedView
            host={activeConnectionData && activeConnectionData.host}
            username={activeConnectionData && activeConnectionData.username}
            showHost
            storeCredentials={storeCredentials}
          />
        </Render>
        <Render
          if={
            frame.type === 'switch-success' &&
            activeConnectionData &&
            dynamicConnectionData &&
            !dynamicConnectionData.authEnabled
          }
        >
          <div>
            <ConnectedView
              host={activeConnectionData && activeConnectionData.host}
              showHost
              hideStoreCredentials
              additionalFooter='You have a working connection with the Neo4j database and server auth is disabled.'
            />
          </div>
        </Render>
      </StyledConnectionBodyContainer>
    </StyledConnectionFrame>
  )
}

const Frame = props => {
  return (
    <FrameTemplate
      header={props.frame}
      contents={<ServerSwitchFrame {...props} />}
    />
  )
}

export default Frame
