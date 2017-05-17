/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { Component } from 'preact'
import { connect } from 'preact-redux'
import FrameTemplate from '../FrameTemplate'
import {
  StyledConnectionFrame,
  StyledConnectionAside,
  StyledConnectionBodyContainer,
  StyledConnectionBody
} from './styled'
import ConnectedView from './ConnectedView'
import {H3} from 'browser-components/headers'
import Visible from 'browser-components/Visible'
import { getActiveConnectionData, getActiveConnection } from 'shared/modules/connections/connectionsDuck'
import { shouldRetainConnectionCredentials } from 'shared/modules/dbMeta/dbMetaDuck'

class ServerStatusFrame extends Component {
  render () {
    const { frame, activeConnectionData, storeCredentials } = this.props

    return (
      <FrameTemplate
        header={frame}
        contents={
          <StyledConnectionFrame>
            <StyledConnectionAside>
              <span>
                <H3>Connection status</H3>
                This is your current server connection information.
              </span>
            </StyledConnectionAside>
            <StyledConnectionBodyContainer>
              <Visible if={!activeConnectionData}>
                <StyledConnectionBody>You are not connected to the server.
                </StyledConnectionBody>
              </Visible>
              <Visible if={activeConnectionData && activeConnectionData.authEnabled}>
                <ConnectedView username={activeConnectionData && activeConnectionData.username}
                               showHost={false} storeCredentials={storeCredentials}/>
              </Visible>
              <Visible if={activeConnectionData && !activeConnectionData.authEnabled}>
                <StyledConnectionBody>You have a working connection with the Neo4j database and server auth is disabled.
                </StyledConnectionBody>
              </Visible>
            </StyledConnectionBodyContainer>
          </StyledConnectionFrame>
        }
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    activeConnection: getActiveConnection(state),
    activeConnectionData: getActiveConnectionData(state),
    storeCredentials: shouldRetainConnectionCredentials(state)
  }
}

export default connect(mapStateToProps, null)(ServerStatusFrame)
