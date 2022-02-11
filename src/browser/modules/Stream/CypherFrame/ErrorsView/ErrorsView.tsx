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
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action, Dispatch } from 'redux'
import { Bus } from 'suber'

import { errorMessageFormater } from '../../errorMessageFormater'
import {
  ErrorText,
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledLink,
  StyledLinkContainer,
  StyledMissingParamsTemplateLink,
  StyledParamsTemplateClickableArea,
  StyledPreformattedArea,
  StyledSpecifyParamsText
} from '../../styled'
import Ellipsis from 'browser-components/Ellipsis'
import {
  ExclamationTriangleIcon,
  PlayIcon
} from 'browser-components/icons/Icons'
import { GlobalState } from 'project-root/src/shared/globalState'
import {
  commandSources,
  executeCommand,
  listDbsCommand
} from 'project-root/src/shared/modules/commands/commandsDuck'
import { listAvailableProcedures } from 'project-root/src/shared/modules/cypher/procedureFactory'
import * as editor from 'project-root/src/shared/modules/editor/editorDuck'
import { getParams } from 'project-root/src/shared/modules/params/paramsDuck'
import { BrowserRequestResult } from 'project-root/src/shared/modules/requests/requestsDuck'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import {
  isImplicitTransactionError,
  isNoDbAccessError,
  isParameterMissingError,
  isUnknownProcedureError
} from 'services/cypherErrorsHelper'
import { BrowserError } from 'services/exceptions'
import { deepEquals } from 'services/utils'
import { stringifyMod } from 'services/utils'

type MissingParamsTemplateLinkProps = {
  error: BrowserError
  params: Record<string, unknown>
  onSetFrameCmd: (cmd: string, autoExec: boolean) => void
}
const MissingParamsTemplateLink = ({
  onSetFrameCmd,
  params,
  error
}: MissingParamsTemplateLinkProps) => {
  const onGenerateMissingParamsTemplate = (
    error: BrowserError,
    params: Record<string, unknown>,
    onSetFrameCmd: (cmd: string, autoExec: boolean) => void
  ): void => {
    const missingParams = getMissingParams(error.message)
    const template = getSettingMissingParamsTemplate(missingParams, params)
    onSetFrameCmd(template, false)
  }

  const getMissingParams = (missingParamsErrorMessage: string) => {
    const regExp = new RegExp(`^Expected parameter\\(s\\): (.*?)$`, 'g')
    const match = regExp.exec(missingParamsErrorMessage)
    if (match && match.length > 1) {
      return match[1].split(', ')
    } else {
      return []
    }
  }
  const getSettingMissingParamsTemplate = (
    missingParams: string[],
    existingParams: Record<string, unknown>
  ): string => {
    const missingParamsTemplate = missingParams
      .map(param => `  "${param}": fill_in_your_value`)
      .join(',\n')

    let existingParamsTemplate = ''
    const existingParamsIsEmpty = Object.keys(existingParams).length === 0
    if (!existingParamsIsEmpty) {
      const existingParamsStringWithBracketsAndSurroundingNewlines =
        stringifyMod(existingParams, stringModifier, true)
      const existingParamsStringCleaned =
        existingParamsStringWithBracketsAndSurroundingNewlines
          .slice(
            1,
            existingParamsStringWithBracketsAndSurroundingNewlines.length - 1
          )
          .trim()
      existingParamsTemplate = `  ${existingParamsStringCleaned}`
    }

    return `:params \n{\n${missingParamsTemplate},\n\n${existingParamsTemplate}\n}`
  }

  return (
    <StyledMissingParamsTemplateLink>
      <span>Use this template to add missing parameter(s):</span>
      <StyledParamsTemplateClickableArea
        onClick={() =>
          onGenerateMissingParamsTemplate(error, params, onSetFrameCmd)
        }
      >
        :params{'{'}
        <StyledSpecifyParamsText>specify params</StyledSpecifyParamsText>
        {'}'}
      </StyledParamsTemplateClickableArea>
    </StyledMissingParamsTemplateLink>
  )
}

export type ErrorsViewProps = {
  result: BrowserRequestResult
  bus: Bus
  params: Record<string, unknown>
  onSetFrameCmd: (cmd: string, autoExec: boolean) => void
}

class ErrorsViewComponent extends Component<ErrorsViewProps> {
  shouldComponentUpdate(props: ErrorsViewProps): boolean {
    return (
      !deepEquals(props.result, this.props.result) ||
      !deepEquals(props.params, this.props.params)
    )
  }

  render(): null | JSX.Element {
    const { params, onSetFrameCmd } = this.props

    const error = this.props.result as BrowserError
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
            <StyledPreformattedArea data-testid={'cypherFrameErrorMessage'}>
              {fullError.message}
            </StyledPreformattedArea>
          </StyledDiv>
          {isUnknownProcedureError(error) && (
            <StyledLinkContainer>
              <StyledLink
                onClick={() => onSetFrameCmd(listAvailableProcedures, true)}
              >
                <PlayIcon />
                &nbsp;List available procedures
              </StyledLink>
            </StyledLinkContainer>
          )}
          {isNoDbAccessError(error) && (
            <StyledLinkContainer>
              <StyledLink
                onClick={() => onSetFrameCmd(`:${listDbsCommand}`, true)}
              >
                <PlayIcon />
                &nbsp;List available databases
              </StyledLink>
            </StyledLinkContainer>
          )}
          {isImplicitTransactionError(error) && (
            <StyledLinkContainer>
              <StyledLink onClick={() => onSetFrameCmd(`:help auto`, true)}>
                <PlayIcon />
                &nbsp;Info on the <code>:auto</code> command
              </StyledLink>
              &nbsp;(auto-committing transactions)
            </StyledLinkContainer>
          )}
          {isParameterMissingError(error) && (
            <MissingParamsTemplateLink
              error={error}
              params={params}
              onSetFrameCmd={onSetFrameCmd}
            />
          )}
        </StyledHelpContent>
      </StyledHelpFrame>
    )
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    params: getParams(state)
  }
}
const mapDispatchToProps = (
  _dispatch: Dispatch<Action>,
  ownProps: ErrorsViewProps
) => {
  return {
    onSetFrameCmd: (cmd: string, autoExec: boolean) => {
      if (autoExec) {
        const action = executeCommand(cmd, {
          source: commandSources.button
        })
        ownProps.bus.send(action.type, action)
      } else {
        ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
      }
    }
  }
}
export const ErrorsView = withBus(
  connect(mapStateToProps, mapDispatchToProps)(ErrorsViewComponent)
)

type ErrorsStatusBarProps = {
  result: BrowserRequestResult
}
export class ErrorsStatusbar extends Component<ErrorsStatusBarProps> {
  shouldComponentUpdate(props: ErrorsStatusBarProps): boolean {
    return !deepEquals(props.result, this.props.result)
  }

  render(): null | JSX.Element {
    const error = this.props.result as BrowserError
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
