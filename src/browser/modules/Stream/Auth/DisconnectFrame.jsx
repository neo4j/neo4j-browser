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
import FrameTemplate from '../../Frame/FrameTemplate'
import { StyledConnectionAside } from './styled'
import { H3 } from 'browser-components/headers'
import { Lead } from 'browser-components/Text'
import Render from 'browser-components/Render'

const Disconnect = ({ frame, activeConnectionData }) => {
  return (
    <FrameTemplate
      header={frame}
      contents={
        <>
          <StyledConnectionAside>
            <Render if={activeConnectionData}>
              <div>
                <H3>Connected</H3>
                <Lead>You're still connected</Lead>
              </div>
            </Render>
            <Render if={!activeConnectionData}>
              <div>
                <H3>Disconnected</H3>
                <Lead>You are disconnected from the server</Lead>
              </div>
            </Render>
          </StyledConnectionAside>
        </>
      }
    />
  )
}

export default Disconnect
