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

import { Component } from 'preact'
import { withBus } from 'preact-suber'
import Ellipsis from 'browser-components/Ellipsis'
import {
  ExclamationTriangleIcon,
  PlayIcon
} from 'browser-components/icons/Icons'
import { deepEquals } from 'services/utils'
import Render from 'browser-components/Render'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { listAvailableProcedures } from 'shared/modules/cypher/procedureFactory'
import { isUnknownProcedureError } from 'services/cypherErrorsHelper'
import { errorMessageFormater } from './../errorMessageFormater'

import {
  StyledCypherErrorMessage,
  StyledHelpContent,
  StyledH4,
  StyledPreformattedArea,
  StyledHelpDescription,
  StyledDiv,
  StyledLink,
  StyledLinkContainer,
  StyledHelpFrame,
  ErrorText
} from '../styled'

export class ErrorsView extends Component {
  shouldComponentUpdate (props, state) {
    return !deepEquals(props.result, this.props.result)
  }
  render () {
    const { result: error, bus } = this.props
    if (!error || !error.code) {
      return null
    }
    const fullError = errorMessageFormater(error.code, error.message)

    return (
      <StyledHelpFrame>
        <StyledHelpContent>
          <StyledHelpDescription>
            <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
            <StyledH4>{error.code}</StyledH4>
          </StyledHelpDescription>
          <StyledDiv>
            <StyledPreformattedArea>{fullError.message}</StyledPreformattedArea>
          </StyledDiv>
          <Render if={isUnknownProcedureError(error)}>
            <StyledLinkContainer>
              <StyledLink onClick={() => onItemClick(bus)}>
                <PlayIcon />&nbsp;List available procedures
              </StyledLink>
            </StyledLinkContainer>
          </Render>
        </StyledHelpContent>
      </StyledHelpFrame>
    )
  }
}

const onItemClick = bus => {
  const action = executeCommand(listAvailableProcedures)
  bus.send(action.type, action)
}

export const ErrorsViewBus = withBus(ErrorsView)

export class ErrorsStatusbar extends Component {
  shouldComponentUpdate (props, state) {
    return !deepEquals(props.result, this.props.result)
  }
  render () {
    const error = this.props.result
    if (!error || (!error.code && !error.message)) return null
    const fullError = errorMessageFormater(error.code, error.message)

    return (
      <Ellipsis>
        <ErrorText title={fullError.title}>
          <ExclamationTriangleIcon /> {fullError.message}
        </ErrorText>
      </Ellipsis>
    )
  }
}
