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

class ServerStatusFrame extends Component {
  render () {
    const {
      frame,
      activeConnectionData: dynamicConnectionData = {}
    } = this.props
    const { activeConnectionData, storeCredentials } = frame
    return (
      <FrameTemplate
        header={frame}
        contents={
          <StyledConnectionFrame>
            <StyledConnectionAside>
              <span>
                <H3>Connection updated</H3>
                You have switched connection.
              </span>
            </StyledConnectionAside>
            <StyledConnectionBodyContainer>
              <Render if={frame.type === 'switch-fail'}>
                <StyledConnectionBody>
                  The connection credentials provided could not be used to
                  connect.
                  <br />
                  You are now disconnected.
                  <br />
                  Execute <ClickToCode>:server connect</ClickToCode> to manually
                  enter credentials.
                </StyledConnectionBody>
              </Render>
              <Render
                if={
                  frame.type === 'switch-success' &&
                  activeConnectionData &&
                  dynamicConnectionData &&
                  dynamicConnectionData.authEnabled
                }
              >
                <ConnectedView
                  host={activeConnectionData && activeConnectionData.host}
                  username={
                    activeConnectionData && activeConnectionData.username
                  }
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
        }
      />
    )
  }
}

export default ServerStatusFrame
