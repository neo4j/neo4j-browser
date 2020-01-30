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

import React, { Component } from 'react'
import { withBus } from 'react-suber'
import Ellipsis from 'browser-components/Ellipsis'
import {
  ExclamationTriangleIcon,
  PlayIcon
} from 'browser-components/icons/Icons'
import { deepEquals } from 'services/utils'
import Render from 'browser-components/Render'
import {
  executeCommand,
  listDbsCommand
} from 'shared/modules/commands/commandsDuck'
import { listAvailableProcedures } from 'shared/modules/cypher/procedureFactory'
import {
  isUnknownProcedureError,
  isNoDbAccessError,
  isPeriodicCommitError
} from 'services/cypherErrorsHelper'
import { errorMessageFormater } from './../errorMessageFormater'

import {
  StyledCypherErrorMessage,
  StyledHelpContent,
  StyledErrorH4,
  StyledPreformattedArea,
  StyledHelpDescription,
  StyledDiv,
  StyledLink,
  StyledLinkContainer,
  StyledHelpFrame,
  ErrorText
} from '../styled'

export class ErrorsView extends Component {
  shouldComponentUpdate(props, state) {
    return !deepEquals(props.result, this.props.result)
  }

  render() {
    const { result: error, bus } = this.props
    if (!error || !error.code) {
      return null
    }
    const fullError = errorMessageFormater(null, error.message)

    return (
      <StyledHelpFrame>
        <StyledHelpContent>
          <StyledHelpDescription>
            <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
            <StyledErrorH4>{error.code}</StyledErrorH4>
          </StyledHelpDescription>
          <StyledDiv>
            <StyledPreformattedArea>{fullError.message}</StyledPreformattedArea>
          </StyledDiv>
          <Render if={isUnknownProcedureError(error)}>
            <StyledLinkContainer>
              <StyledLink
                onClick={() => onItemClick(bus, listAvailableProcedures)}
              >
                <PlayIcon />
                &nbsp;List available procedures
              </StyledLink>
            </StyledLinkContainer>
          </Render>
          <Render if={isNoDbAccessError(error)}>
            <StyledLinkContainer>
              <StyledLink
                onClick={() => onItemClick(bus, `:${listDbsCommand}`)}
              >
                <PlayIcon />
                &nbsp;List available databases
              </StyledLink>
            </StyledLinkContainer>
          </Render>
          <Render if={isPeriodicCommitError(error)}>
            <StyledLinkContainer>
              <StyledLink onClick={() => onItemClick(bus, `:help auto`)}>
                <PlayIcon />
                &nbsp;Info on the <code>:auto</code> command
              </StyledLink>
              &nbsp;(auto-committing transactions)
            </StyledLinkContainer>
          </Render>
        </StyledHelpContent>
      </StyledHelpFrame>
    )
  }
}

const onItemClick = (bus, statement) => {
  const action = executeCommand(statement)
  bus.send(action.type, action)
}

export const ErrorsViewBus = withBus(ErrorsView)

export class ErrorsStatusbar extends Component {
  shouldComponentUpdate(props, state) {
    return !deepEquals(props.result, this.props.result)
  }

  render() {
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
