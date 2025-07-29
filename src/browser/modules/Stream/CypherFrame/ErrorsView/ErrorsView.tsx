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

import { PlayIcon } from 'browser-components/icons/LegacyIcons'

import {
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledLink,
  StyledLinkContainer,
  StyledPreformattedArea
} from '../../styled'
import { MissingParamsTemplateLink } from './MissingParamsTemplateLink'
import { GlobalState } from 'project-root/src/shared/globalState'
import {
  commandSources,
  executeCommand,
  listDbsCommand
} from 'project-root/src/shared/modules/commands/commandsDuck'
import { getListProcedureQuery } from 'shared/modules/cypher/functionsAndProceduresHelper'
import * as editor from 'project-root/src/shared/modules/editor/editorDuck'
import { getParams } from 'project-root/src/shared/modules/params/paramsDuck'
import { BrowserRequestResult } from 'project-root/src/shared/modules/requests/requestsDuck'
import { GENERATE_SET_MISSING_PARAMS_TEMPLATE } from 'project-root/src/shared/modules/udc/udcDuck'
import {
  isImplicitTransactionError,
  isNoDbAccessError,
  isParameterMissingError,
  isUnknownProcedureError
} from 'services/cypherErrorsHelper'
import { BrowserError } from 'services/exceptions'
import { deepEquals } from 'neo4j-arc/common'
import { getSemanticVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import { SemVer } from 'semver'
import {
  flattenAndInvertErrors,
  formatError,
  FormattedError
} from '../errorUtils'
import { gqlErrorsAndNotificationsEnabled } from 'services/gqlUtils'
import styled from 'styled-components'

const StyledErrorsViewInnerComponentContent = styled.div<{ nested: boolean }>`
  padding-left: ${props => (props.nested ? '20px' : '0')};
`

type ErrorsViewInnerProps = {
  formattedError: FormattedError
  nested?: boolean
}

class ErrorsViewInnerComponent extends Component<ErrorsViewInnerProps> {
  render(): null | JSX.Element {
    const { formattedError, nested = false } = this.props

    return (
      <StyledErrorsViewInnerComponentContent nested={nested}>
        <StyledHelpDescription>
          {!nested && (
            <React.Fragment>
              <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
              <StyledErrorH4>{formattedError.title}</StyledErrorH4>
            </React.Fragment>
          )}
          {nested && <h6>{formattedError.title}</h6>}
        </StyledHelpDescription>
        {formattedError.description && (
          <StyledDiv>
            <StyledPreformattedArea data-testid={'cypherFrameErrorMessage'}>
              {formattedError?.description}
            </StyledPreformattedArea>
          </StyledDiv>
        )}
      </StyledErrorsViewInnerComponentContent>
    )
  }
}

export type ErrorsViewProps = {
  result: BrowserRequestResult
  bus: Bus
  neo4jVersion: SemVer | null
  params: Record<string, unknown>
  executeCmd: (cmd: string) => void
  setEditorContent: (cmd: string) => void
  depth?: number
  gqlErrorsAndNotificationsEnabled?: boolean
}

type ErrorsViewState = {
  nestedErrorsToggled: boolean
}

class ErrorsViewComponent extends Component<ErrorsViewProps, ErrorsViewState> {
  state = {
    nestedErrorsToggled: false
  }

  shouldComponentUpdate(
    props: ErrorsViewProps,
    state: ErrorsViewState
  ): boolean {
    return (
      !deepEquals(props.result, this.props.result) ||
      !deepEquals(props.params, this.props.params) ||
      !deepEquals(state, this.state)
    )
  }

  render(): null | JSX.Element {
    const {
      bus,
      params,
      executeCmd,
      setEditorContent,
      neo4jVersion,
      gqlErrorsAndNotificationsEnabled = false
    } = this.props

    const error = this.props.result as BrowserError

    const invertedErrors = flattenAndInvertErrors(
      error,
      gqlErrorsAndNotificationsEnabled
    )
    const [deepestError] = invertedErrors
    const nestedErrors = invertedErrors.slice(1)
    const togglable = nestedErrors.length > 0
    const setNestedErrorsToggled = (toggled: boolean) => {
      this.setState({
        nestedErrorsToggled: toggled
      })
    }

    if (!error) {
      return null
    }

    const formattedError = formatError(
      deepestError,
      gqlErrorsAndNotificationsEnabled
    )

    if (!formattedError?.title) {
      return null
    }

    const handleSetMissingParamsTemplateHelpMessageClick = () => {
      bus.send(GENERATE_SET_MISSING_PARAMS_TEMPLATE, undefined)
    }

    return (
      <StyledHelpFrame>
        <StyledHelpContent>
          <ErrorsViewInnerComponent formattedError={formattedError} />
          {isUnknownProcedureError(error) && (
            <StyledLinkContainer>
              <StyledLink
                onClick={() => executeCmd(getListProcedureQuery(neo4jVersion))}
              >
                <PlayIcon />
                &nbsp;List available procedures
              </StyledLink>
            </StyledLinkContainer>
          )}
          {isNoDbAccessError(error) && (
            <StyledLinkContainer>
              <StyledLink onClick={() => executeCmd(`:${listDbsCommand}`)}>
                <PlayIcon />
                &nbsp;List available databases
              </StyledLink>
            </StyledLinkContainer>
          )}
          {isImplicitTransactionError(error) && (
            <StyledLinkContainer>
              <StyledLink onClick={() => executeCmd(`:help auto`)}>
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
              setEditorContent={setEditorContent}
              onTemplateHelpMessageClick={
                handleSetMissingParamsTemplateHelpMessageClick
              }
            />
          )}
          {togglable && (
            <StyledLinkContainer>
              <StyledLink
                onClick={() =>
                  setNestedErrorsToggled(!this.state.nestedErrorsToggled)
                }
              >
                &nbsp;
                {this.state.nestedErrorsToggled ? 'Show less' : 'Show more'}
              </StyledLink>
            </StyledLinkContainer>
          )}
          {this.state.nestedErrorsToggled &&
            nestedErrors.map((nestedError, index) => (
              <ErrorsViewInnerComponent
                key={index}
                nested={true}
                formattedError={formatError(
                  nestedError,
                  gqlErrorsAndNotificationsEnabled
                )}
              />
            ))}
        </StyledHelpContent>
      </StyledHelpFrame>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  params: getParams(state),
  neo4jVersion: getSemanticVersion(state),
  gqlErrorsAndNotificationsEnabled: gqlErrorsAndNotificationsEnabled(state)
})

const mapDispatchToProps = (
  _dispatch: Dispatch<Action>,
  ownProps: ErrorsViewProps
) => {
  return {
    executeCmd: (cmd: string) => {
      const action = executeCommand(cmd, {
        source: commandSources.button
      })
      ownProps.bus.send(action.type, action)
    },
    setEditorContent: (cmd: string) => {
      ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
    }
  }
}

export const ErrorsView = withBus(
  connect(mapStateToProps, mapDispatchToProps)(ErrorsViewComponent)
)
