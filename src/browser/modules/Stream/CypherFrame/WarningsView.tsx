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

import {
  StyledBr,
  StyledCypherErrorMessage,
  StyledCypherMessage,
  StyledCypherWarningMessage,
  StyledDiv,
  StyledH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledPreformattedArea,
  StyledCode,
  StyledCypherInfoMessage
} from '../styled'
import { deepEquals } from 'neo4j-arc/common'
import {
  formatSummaryFromGqlStatusObjects,
  formatSummaryFromNotifications,
  FormattedNotification
} from './warningUtilts'
import { NotificationSeverityLevel, QueryResult } from 'neo4j-driver-core'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { GlobalState } from 'shared/globalState'
import { Bus } from 'suber'
import { getSemanticVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import { gte } from 'semver'
import { FIRST_GQL_NOTIFICATIONS_SUPPORT } from 'shared/modules/features/versionedFeatures'
import { shouldShowGqlErrorsAndNotifications } from 'shared/modules/settings/settingsDuck'

const getWarningComponent = (severity?: string | NotificationSeverityLevel) => {
  if (severity === 'ERROR') {
    return <StyledCypherErrorMessage>{severity}</StyledCypherErrorMessage>
  } else if (severity === 'WARNING') {
    return <StyledCypherWarningMessage>{severity}</StyledCypherWarningMessage>
  } else if (severity === 'INFORMATION') {
    return <StyledCypherInfoMessage>{severity}</StyledCypherInfoMessage>
  } else {
    return <StyledCypherMessage>{severity}</StyledCypherMessage>
  }
}

export type WarningsViewProps = {
  result?: QueryResult | null
  bus: Bus
  gqlWarningsEnabled: boolean
}

class WarningsViewComponent extends Component<WarningsViewProps> {
  shouldComponentUpdate(props: WarningsViewProps) {
    if (!this.props.result) return true
    return !deepEquals(props.result?.summary, this.props.result.summary)
  }

  render() {
    if (
      this.props.result === undefined ||
      this.props.result === null ||
      this.props.result.summary === undefined
    )
      return null

    const { summary } = this.props.result
    const notifications = this.props.gqlWarningsEnabled
      ? formatSummaryFromGqlStatusObjects(summary)
      : formatSummaryFromNotifications(summary)
    const { text: cypher = '' } = summary.query

    if (!notifications || !cypher) {
      return null
    }

    const cypherLines = cypher.split('\n')
    const notificationsList = notifications.map(
      (notification: FormattedNotification) => {
        // Detect generic warning without position information
        const { code, description, severity } = notification
        const position = notification.position ?? { line: 1, offset: 0 }
        const title = notification.title ?? ''
        const line = position.line ?? 1
        const offset = position.offset ?? 0

        return (
          <StyledHelpContent key={title + line + position.offset}>
            <StyledHelpDescription>
              {getWarningComponent(severity)}
              <StyledH4>{title}</StyledH4>
            </StyledHelpDescription>
            <StyledDiv>
              <StyledHelpDescription>{description}</StyledHelpDescription>
              <StyledDiv>
                <StyledPreformattedArea>
                  {cypherLines[line - 1]}
                  <StyledBr />
                  {Array(offset + 1).join(' ')}^
                </StyledPreformattedArea>
              </StyledDiv>
            </StyledDiv>
            {code && (
              <StyledDiv style={{ marginTop: '10px' }}>
                Status code: <StyledCode>{code}</StyledCode>
              </StyledDiv>
            )}
          </StyledHelpContent>
        )
      }
    )
    return <StyledHelpFrame>{notificationsList}</StyledHelpFrame>
  }
}

const gqlWarningsEnabled = (state: GlobalState): boolean => {
  const featureEnabled = shouldShowGqlErrorsAndNotifications(state)
  const version = getSemanticVersion(state)
  return version
    ? featureEnabled && gte(version, FIRST_GQL_NOTIFICATIONS_SUPPORT)
    : false
}

const mapStateToProps = (state: GlobalState) => ({
  gqlWarningsEnabled: gqlWarningsEnabled(state)
})

export const WarningsView = withBus(
  connect(mapStateToProps, null)(WarningsViewComponent)
)

export class WarningsStatusbar extends Component<any> {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return null
  }
}
