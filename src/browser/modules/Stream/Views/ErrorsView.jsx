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

import { withBus } from 'preact-suber'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { listAvailableProcedures } from 'shared/modules/cypher/procedureFactory'
import { isUnknownProcedureError } from 'services/cypherErrorsHelper'
import Visible from 'browser-components/Visible'
import { PlayIcon } from 'browser-components/icons/Icons'
import {
  StyledCypherErrorMessage,
  StyledHelpContent,
  StyledH4,
  StyledPreformattedArea,
  StyledHelpDescription,
  StyledDiv,
  StyledLink,
  StyledLinkContainer,
  StyledHelpFrame
} from '../styled'

const ErrorsView = ({error, style, bus}) => {
  if (!error) {
    return null
  }
  return (
    <StyledHelpFrame style={style}>
      <StyledHelpContent>
        <StyledHelpDescription>
          <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
          <StyledH4>{error.code}</StyledH4>
        </StyledHelpDescription>
        <StyledDiv>
          <StyledPreformattedArea>{error.message}</StyledPreformattedArea>
        </StyledDiv>
        <Visible if={isUnknownProcedureError(error)}>
          <StyledLinkContainer>
            <StyledLink onClick={() => onItemClick(bus)}><PlayIcon />&nbsp;List available procedures</StyledLink>
          </StyledLinkContainer>
        </Visible>
      </StyledHelpContent>
    </StyledHelpFrame>)
}

const onItemClick = (bus) => {
  const action = executeCommand(listAvailableProcedures)
  bus.send(action.type, action)
}

export default withBus(ErrorsView)
