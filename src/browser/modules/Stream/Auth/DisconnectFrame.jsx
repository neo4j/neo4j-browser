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

import FrameTemplate from '../FrameTemplate'
import { StyledConnectionFrame, StyledConnectionAside } from './styled'
import {H3} from 'browser-components/headers'
import Visible from 'browser-components/Visible'

const Disconnect = ({frame, activeConnectionData}) => {
  return (
    <FrameTemplate
      header={frame}
      contents={
        <StyledConnectionFrame>
          <StyledConnectionAside>
            <Visible if={activeConnectionData}>
              <span>
                <H3>Connected</H3>
                {'You\'re still connected'}
              </span>
            </Visible>
            <Visible if={!activeConnectionData}>
              <span>
                <H3>Disconnected</H3>
                You are disconnected from the server
              </span>
            </Visible>
          </StyledConnectionAside>
        </StyledConnectionFrame>
      }
    />
  )
}

export default Disconnect
