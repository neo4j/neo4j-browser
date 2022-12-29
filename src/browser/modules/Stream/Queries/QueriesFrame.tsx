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
import { Bus } from 'suber'

import FrameBodyTemplate from '../../Frame/FrameBodyTemplate'
import FrameError from '../../Frame/FrameError'
import {
  AutoRefreshSpan,
  AutoRefreshToggle,
  StatusbarWrapper,
  StyledStatusBar
} from '../AutoRefresh/styled'
import {
  Code,
  StyledHeaderRow,
  StyledTable,
  StyledTableWrapper,
  StyledTd,
  StyledTh
} from './styled'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import { GlobalState } from 'project-root/src/shared/globalState'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import {
  CONNECTED_STATE,
  getConnectionState
} from 'shared/modules/connections/connectionsDuck'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { durationFormat } from 'services/bolt/cypherTypesFormatting'
import { Frame } from 'shared/modules/frames/framesDuck'
import LegacyQueriesFrame, {
  LegacyQueriesFrameProps
} from './LegacyQueriesFrame'
import {
  getRawVersion,
  getSemanticVersion,
  hasProcedure,
  isOnCluster
} from 'shared/modules/dbMeta/dbMetaDuck'
import { gte } from 'semver'

type QueriesFrameState = {
  queries: any[]
  autoRefresh: boolean
  autoRefreshInterval: number
  successMessage: null | string
  errorMessages: string[]
}

type QueriesFrameProps = {
  frame?: Frame
  bus: Bus
  connectionState: number
  isFullscreen: boolean
  isCollapsed: boolean
}

function constructOverviewMessage(queries: any, errors: string[]) {
  const numQueriesMsg = queries.length > 1 ? 'queries' : 'query'
  const successMessage = `Found ${queries.length} ${numQueriesMsg} on one server (neo4j 5.0 clusters not yet supported).`

  return errors.length > 0
    ? `${successMessage} (${errors.length} unsuccessful)`
    : successMessage
}

export class QueriesFrame extends Component<
  QueriesFrameProps,
  QueriesFrameState
> {
  timer: number | undefined
  state: QueriesFrameState = {
    queries: [],
    autoRefresh: false,
    autoRefreshInterval: 20, // seconds
    successMessage: null,
    errorMessages: []
  }

  componentDidMount(): void {
    if (this.props.connectionState === CONNECTED_STATE) {
      this.getRunningQueries()
    } else {
      this.setState({
        errorMessages: ['Unable to connect to neo4j']
      })
    }
  }

  componentDidUpdate(
    prevProps: QueriesFrameProps,
    prevState: QueriesFrameState
  ): void {
    if (prevState.autoRefresh !== this.state.autoRefresh) {
      if (this.state.autoRefresh) {
        this.timer = setInterval(
          this.getRunningQueries,
          this.state.autoRefreshInterval * 1000
        )
      } else {
        clearInterval(this.timer)
      }
    }
    if (
      this.props.frame &&
      this.props.frame.ts !== prevProps.frame?.ts &&
      this.props.frame.isRerun
    ) {
      this.getRunningQueries()
    }
  }

  getRunningQueries = (suppressQuerySuccessMessage = false): void => {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query:
          'SHOW TRANSACTIONS YIELD currentQuery, username, metaData, parameters, status, elapsedTime, database, transactionId',
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      resp => {
        if (resp.success) {
          const queries = resp.result.records.map(
            ({ host, keys, _fields, error }: any) => {
              if (error) return { error }
              const nonNullHost = host ?? resp.result.summary.server.address
              const data: any = {}
              keys.forEach((key: string, idx: number) => {
                data[key] = _fields[idx]
              })

              return {
                ...data,
                host: `neo4j://${nonNullHost}`,
                query: data.currentQuery,
                elapsedTimeMillis: durationFormat(data.elapsedTime),
                queryId: data.transactionId
              }
            }
          )

          const errors = queries
            .filter((_: any) => _.error)
            .map((e: any) => ({
              ...e.error
            }))
          const validQueries = queries.filter((_: any) => !_.error)
          const resultMessage = constructOverviewMessage(validQueries, errors)

          this.setState((prevState: QueriesFrameState) => ({
            queries: validQueries,
            errorMessages: errors,
            successMessage: suppressQuerySuccessMessage
              ? prevState.successMessage
              : resultMessage
          }))
        }
      }
    )
  }

  killQueries(queryIdList: string[]): void {
    this.props.bus.self(
      CYPHER_REQUEST,
      {
        query: `TERMINATE TRANSACTIONS ${queryIdList
          .map(q => `"${q}"`)
          .join(',')}`,
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      (response: any) => {
        if (response.success) {
          this.setState({
            successMessage: 'Query successfully cancelled',
            errorMessages: []
          })
          this.getRunningQueries(true)
        } else {
          this.setState(state => ({
            errorMessages: state.errorMessages.concat([response.error.message]),
            successMessage: null
          }))
        }
      }
    )
  }

  killQuery(queryId: string): void {
    this.killQueries([queryId])
  }

  constructViewFromQueryList = (): JSX.Element | null => {
    const { queries, errorMessages: errors } = this.state
    if (queries.length === 0) {
      return null
    }
    const tableHeaderSizes = [
      ['Database', '8%'],
      ['User', '8%'],
      ['Query', 'auto'],
      ['Params', '7%'],
      ['Meta', 'auto'],
      ['Elapsed time', '95px'],
      ['Kill', '95px']
    ]

    return (
      <StyledTableWrapper>
        <StyledTable>
          <thead>
            <StyledHeaderRow>
              {tableHeaderSizes.map(heading => (
                <StyledTh width={heading[1]} key={heading[0]}>
                  {heading[0]}
                </StyledTh>
              ))}
            </StyledHeaderRow>
          </thead>
          <tbody>
            {queries.map((query: any, i: number) => (
              <tr key={`rows${i}`}>
                <StyledTd
                  key="db"
                  title={query.database}
                  width={tableHeaderSizes[0][1]}
                >
                  <Code>{query.database}</Code>
                </StyledTd>
                <StyledTd key="username" width={tableHeaderSizes[1][1]}>
                  {query.username}
                </StyledTd>
                <StyledTd
                  key="query"
                  title={query.query}
                  width={tableHeaderSizes[2][1]}
                >
                  <Code>{query.query}</Code>
                </StyledTd>
                <StyledTd key="params" width={tableHeaderSizes[3][1]}>
                  <Code>{JSON.stringify(query.parameters, null, 2)}</Code>
                </StyledTd>
                <StyledTd
                  key="meta"
                  title={JSON.stringify(query.metaData, null, 2)}
                  width={tableHeaderSizes[4][1]}
                >
                  <Code>{JSON.stringify(query.metaData, null, 2)}</Code>
                </StyledTd>
                <StyledTd key="time" width={tableHeaderSizes[5][1]}>
                  {query.elapsedTimeMillis} ms
                </StyledTd>
                <StyledTd key="actions" width={tableHeaderSizes[6][1]}>
                  <ConfirmationButton
                    onConfirmed={() => this.killQuery(query.queryId)}
                  />
                </StyledTd>
              </tr>
            ))}

            {errors.map((error: any, i: number) => (
              <tr key={`error${i}`}>
                <StyledTd colSpan={7} title={error.message}>
                  <Code>Error connecting to: {error.host}</Code>
                </StyledTd>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </StyledTableWrapper>
    )
  }

  setAutoRefresh(autoRefresh: boolean): void {
    this.setState({ autoRefresh })

    if (autoRefresh) {
      this.getRunningQueries()
    }
  }

  render(): JSX.Element {
    const { isCollapsed, isFullscreen } = this.props
    const { errorMessages, successMessage, autoRefresh } = this.state

    return (
      <FrameBodyTemplate
        isCollapsed={isCollapsed}
        isFullscreen={isFullscreen}
        contents={this.constructViewFromQueryList()}
        statusBar={
          <StatusbarWrapper>
            {successMessage ? (
              <StyledStatusBar>
                {successMessage}
                <AutoRefreshSpan>
                  <AutoRefreshToggle
                    checked={autoRefresh}
                    onChange={e => this.setAutoRefresh(e.target.checked)}
                  />
                </AutoRefreshSpan>
              </StyledStatusBar>
            ) : (
              errorMessages && <FrameError message={errorMessages.join(',')} />
            )}
          </StatusbarWrapper>
        }
      />
    )
  }
}

const mapStateToProps = (state: GlobalState) => {
  const version = getSemanticVersion(state)
  const versionOverFive = version
    ? gte(version, '5.0.0')
    : true /* assume we're 5.0 */

  return {
    hasListQueriesProcedure: hasProcedure(state, 'dbms.listQueries'),
    versionOverFive,
    connectionState: getConnectionState(state),
    neo4jVersion: getRawVersion(state),
    isOnCluster: isOnCluster(state)
  }
}

export default withBus(
  connect(mapStateToProps)((props: LegacyQueriesFrameProps) => {
    return props.versionOverFive ? (
      <QueriesFrame {...props} />
    ) : (
      <LegacyQueriesFrame {...props} />
    )
  })
)
