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

import FrameBodyTemplate from '../../Frame/FrameBodyTemplate'
import { StyledConnectionAside } from './styled'
import { Lead } from 'browser-components/Text'
import { H3 } from 'browser-components/headers'

const Disconnect = ({
  activeConnectionData,
  isCollapsed,
  isFullscreen
}: any) => {
  return (
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={
        <StyledConnectionAside>
          {activeConnectionData ? (
            <div>
              <H3>Connected</H3>
              <Lead>You're still connected</Lead>
            </div>
          ) : (
            <div>
              <H3>Disconnected</H3>
              <Lead>You are disconnected from the server</Lead>
            </div>
          )}
        </StyledConnectionAside>
      }
    />
  )
}

export default Disconnect
