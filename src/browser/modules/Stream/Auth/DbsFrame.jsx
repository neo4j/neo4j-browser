/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import FrameTemplate from '../FrameTemplate'
import {
  StyledConnectionFrame,
  StyledConnectionAside,
  StyledConnectionBodyContainer,
  StyledConnectionBody
} from './styled'
import { H3 } from 'browser-components/headers'
import Render from 'browser-components/Render/index'
import { toKeyString } from 'services/utils'

export const DbsFrame = props => {
  const { frame } = props
  const { dbs = [] } = frame

  return (
    <StyledConnectionFrame>
      <StyledConnectionAside>
        <span>
          <React.Fragment>
            <H3>Avaialble databases</H3>
            Databases available to the current user.
          </React.Fragment>
        </span>
      </StyledConnectionAside>
      <StyledConnectionBodyContainer>
        <StyledConnectionBody>
          <Render if={dbs.length}>
            These databases are available. Click on one to switch to using it.
            <ul>
              {dbs.map(db => {
                return <li key={toKeyString(db)}>{db}</li>
              })}
            </ul>
          </Render>
          <Render if={!dbs.length}>
            Either you don't have permission to list available databases or the
            dbms you're connected to don't support multiple databases.
          </Render>
        </StyledConnectionBody>
      </StyledConnectionBodyContainer>
    </StyledConnectionFrame>
  )
}

const Frame = props => {
  return (
    <FrameTemplate header={props.frame} contents={<DbsFrame {...props} />} />
  )
}

export default Frame
