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
import { gte, SemVer } from 'semver'
import {
  formatError,
  formatErrorGqlStatusObject,
  hasPopulatedGqlFields
} from '../errorUtils'
import { FIRST_GQL_ERRORS_SUPPORT } from 'shared/modules/features/versionedFeatures'
import { shouldShowGqlErrorsAndNotifications } from 'shared/modules/settings/settingsDuck'

export type ErrorsViewProps = {
  result: BrowserRequestResult
  bus: Bus
  neo4jVersion: SemVer | null
  params: Record<string, unknown>
  executeCmd: (cmd: string) => void
  setEditorContent: (cmd: string) => void
  depth?: number
  gqlErrorsEnabled: boolean
}

class ErrorsViewComponent extends Component<ErrorsViewProps> {
  shouldComponentUpdate(props: ErrorsViewProps): boolean {
    return (
      !deepEquals(props.result, this.props.result) ||
      !deepEquals(props.params, this.props.params)
    )
  }

  render(): null | JSX.Element {
    const {
      bus,
      params,
      executeCmd,
      setEditorContent,
      neo4jVersion,
      depth = 0,
      gqlErrorsEnabled
    } = this.props

    const error = this.props.result as BrowserError
    if (!error) {
      return null
    }

    const formattedError =
      gqlErrorsEnabled && hasPopulatedGqlFields(error)
        ? formatErrorGqlStatusObject(error)
        : formatError(error)

    if (!formattedError?.title) {
      return null
    }

    const handleSetMissingParamsTemplateHelpMessageClick = () => {
      bus.send(GENERATE_SET_MISSING_PARAMS_TEMPLATE, undefined)
    }

    return (
      <StyledHelpFrame nested={depth > 0}>
        <StyledHelpContent>
          <StyledHelpDescription>
            {depth === 0 && (
              <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
            )}
            <StyledErrorH4>{formattedError.title}</StyledErrorH4>
          </StyledHelpDescription>
          {formattedError.description && (
            <StyledDiv>
              <StyledPreformattedArea data-testid={'cypherFrameErrorMessage'}>
                {formattedError?.description}
              </StyledPreformattedArea>
            </StyledDiv>
          )}
          {formattedError.innerError && (
            <ErrorsView result={formattedError.innerError} depth={depth + 1} />
          )}
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
        </StyledHelpContent>
      </StyledHelpFrame>
    )
  }
}

const gqlErrorsEnabled = (state: GlobalState): boolean => {
  const featureEnabled = shouldShowGqlErrorsAndNotifications(state)
  const version = getSemanticVersion(state)
  return version
    ? featureEnabled && gte(version, FIRST_GQL_ERRORS_SUPPORT)
    : false
}

const mapStateToProps = (state: GlobalState) => ({
  params: getParams(state),
  neo4jVersion: getSemanticVersion(state),
  gqlErrorsEnabled: gqlErrorsEnabled(state)
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
