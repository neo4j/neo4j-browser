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
import { getBodyAndStatusBarMessages } from 'browser/modules/Stream/CypherFrame/helpers'
import { errorMessageFormater } from 'browser/modules/Stream/errorMessageFormater'
import {
  StyledCypherErrorMessage,
  StyledCypherWarningMessage,
  StyledCypherSuccessMessage,
  StyledCypherInfoMessage
} from 'browser/modules/Stream/styled'
import { MessageArea, PaddedStatsBar } from './styled'
import { whitelistedMultiCommands } from 'shared/modules/commands/commandsDuck'

const ucFirst = str => str[0].toUpperCase() + str.slice(1)

const GenericSummary = ({ status }) => {
  switch (status) {
    case 'skipped':
      return (
        <PaddedStatsBar>
          <StyledCypherInfoMessage>INFO</StyledCypherInfoMessage>
          <MessageArea>
            This statements was not executed due to a previous error.
          </MessageArea>
        </PaddedStatsBar>
      )
    case 'pending':
      return (
        <PaddedStatsBar>
          <StyledCypherInfoMessage>INFO</StyledCypherInfoMessage>
          <MessageArea>Currently executing this query...</MessageArea>
        </PaddedStatsBar>
      )
    case 'waiting':
      return (
        <PaddedStatsBar>
          <StyledCypherInfoMessage>INFO</StyledCypherInfoMessage>
          <MessageArea>
            This query is waiting for it&apos;s turn. The execution is serial
            and will break on first error.
          </MessageArea>
        </PaddedStatsBar>
      )
    case 'ignored':
      return (
        <PaddedStatsBar>
          <StyledCypherWarningMessage>WARNING</StyledCypherWarningMessage>
          <MessageArea>
            Only the commands{' '}
            {whitelistedMultiCommands().map((cmd, i) => {
              const maybeComma = i > 0 ? ', ' : ''
              return [maybeComma, <code key={cmd}>{cmd}</code>]
            })}{' '}
            and Cypher will be executed in the multi-statement mode.
          </MessageArea>
        </PaddedStatsBar>
      )
  }
}

export const CypherSummary = ({ status, request }) => {
  switch (status) {
    case 'skipped':
      return <GenericSummary status={status} />
    case 'pending':
      return <GenericSummary status={status} />
    case 'waiting':
      return <GenericSummary status={status} />
    case 'success':
      const { bodyMessage } = getBodyAndStatusBarMessages(
        request.result,
        999999999
      )
      return (
        <PaddedStatsBar>
          <StyledCypherSuccessMessage>SUCCESS</StyledCypherSuccessMessage>
          <MessageArea>{ucFirst(bodyMessage)}</MessageArea>
        </PaddedStatsBar>
      )
    case 'error':
      const fullError = errorMessageFormater(
        request.result.code,
        request.result.message
      )
      return (
        <PaddedStatsBar>
          <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
          <MessageArea>{fullError.message}</MessageArea>
        </PaddedStatsBar>
      )
  }
}

export const Summary = ({ status, request }) => {
  switch (status) {
    case 'ignored':
      return <GenericSummary status={status} />
    case 'skipped':
      return <GenericSummary status={status} />
    case 'pending':
      return <GenericSummary status={status} />
    case 'waiting':
      return <GenericSummary status={status} />
    case 'success':
      return (
        <PaddedStatsBar>
          <StyledCypherSuccessMessage>SUCCESS</StyledCypherSuccessMessage>
          <MessageArea>Command was successfully executed</MessageArea>
        </PaddedStatsBar>
      )
    case 'error':
      return (
        <PaddedStatsBar>
          <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
          <MessageArea>
            {(request.result || {}).message || 'Unknown error'}
          </MessageArea>
        </PaddedStatsBar>
      )
  }
}
