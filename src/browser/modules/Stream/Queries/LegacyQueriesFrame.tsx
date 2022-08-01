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
import { Bus } from 'suber'

import FrameAside from '../../Frame/FrameAside'
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
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import bolt from 'services/bolt/bolt'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { CONNECTED_STATE } from 'shared/modules/connections/connectionsDuck'
import {
  AD_HOC_CYPHER_REQUEST,
  CLUSTER_CYPHER_REQUEST,
  CYPHER_REQUEST
} from 'shared/modules/cypher/cypherDuck'
import {
  killQueriesProcedure,
  listQueriesProcedure
} from 'shared/modules/cypher/queriesProcedureHelper'

import { getDefaultBoltScheme } from 'shared/modules/features/versionedFeatures'

type LegacyQueriesFrameState = {
  queries: any[]
  autoRefresh: boolean
  autoRefreshInterval: number
  success: null | boolean | string
  errors: any[]
}

export type LegacyQueriesFrameProps = {
  frame: any
  bus: Bus
  hasListQueriesProcedure: boolean
  connectionState: number
  neo4jVersion: string | null
  isFullscreen: boolean
  versionOverFive: boolean
  isCollapsed: boolean
  isOnCluster: boolean
}
export class LegacyQueriesFrame extends Component<
  LegacyQueriesFrameProps,
  LegacyQueriesFrameState
> {
  timer: any
  state = {
    queries: [],
    autoRefresh: false,
    autoRefreshInterval: 20, // seconds
    success: null,
    errors: []
  }

  componentDidMount() {
    if (this.props.connectionState === CONNECTED_STATE) {
      this.getRunningQueries()
    } else {
      this.setState({ errors: [new Error('Unable to connect to bolt server')] })
    }
  }

  componentDidUpdate(prevProps: any, prevState: LegacyQueriesFrameState) {
    if (prevState.autoRefresh !== this.state.autoRefresh) {
      if (this.state.autoRefresh) {
        this.timer = setInterval(
          this.getRunningQueries.bind(this),
          this.state.autoRefreshInterval * 1000
        )
      } else {
        clearInterval(this.timer)
      }
    }
    if (
      (this.props.frame &&
        this.props.frame.ts !== prevProps.frame.ts &&
        this.props.frame.isRerun) ||
      this.props.isOnCluster !== prevProps.isOnCluster
    ) {
      this.getRunningQueries()
    }
  }

  getRunningQueries(suppressQuerySuccessMessage = false) {
    this.props.bus.self(
      this.props.isOnCluster ? CLUSTER_CYPHER_REQUEST : CYPHER_REQUEST,
      {
        query: listQueriesProcedure(),
        queryType: NEO4J_BROWSER_USER_ACTION_QUERY
      },
      (response: any) => {
        if (response.success) {
          const queries = this.extractQueriesFromBoltResult(response.result)
          const errors = queries
            .filter((_: any) => _.error)
            .map((e: any) => ({
              ...e.error
            }))
          const validQueries = queries.filter((_: any) => !_.error)
          const resultMessage = this.constructOverviewMessage(
            validQueries,
            errors
          )

          this.setState((prevState: any) => {
            return {
              queries: validQueries,
              errors,
              success: suppressQuerySuccessMessage
                ? prevState.success
                : resultMessage
            }
          })
        } else {
          const errors: any[] = this.state.errors || []
          this.setState({
            errors: errors.concat([response.error]),
            success: false
          })
        }
      }
    )
  }

  killQueries(host: any, queryIdList: any) {
    this.props.bus.self(
      this.props.isOnCluster ? AD_HOC_CYPHER_REQUEST : CYPHER_REQUEST,
      { host, query: killQueriesProcedure(queryIdList) },
      (response: any) => {
        if (response.success) {
          this.setState({
            success: 'Query successfully cancelled',
            errors: []
          })
          this.getRunningQueries(true)
        } else {
          const errors: any[] = this.state.errors || []
          this.setState({
            errors: errors.concat([response.error]),
            success: false
          })
        }
      }
    )
  }

  extractQueriesFromBoltResult(result: any) {
    return result.records.map(({ keys, _fields, host, error }: any) => {
      if (error) {
        return { error }
      }
      const queryInfo: any = {}
      keys.forEach((key: any, idx: any) => {
        queryInfo[key] = bolt.itemIntToNumber(_fields[idx])
      })
      if (host) {
        queryInfo.host = getDefaultBoltScheme(this.props.neo4jVersion) + host
      } else {
        queryInfo.host =
          getDefaultBoltScheme(this.props.neo4jVersion) +
          result.summary.server.address
      }
      return queryInfo
    })
  }

  onCancelQuery(host: any, queryId: any) {
    this.killQueries(host, [queryId])
  }

  constructOverviewMessage(queries: any, errors: any) {
    const clusterCount = new Set(queries.map((query: any) => query.host)).size

    const numMachinesMsg =
      clusterCount > 1
        ? `running on ${clusterCount} cluster servers`
        : 'running on one server'

    const numQueriesMsg = queries.length > 1 ? 'queries' : 'query'

    const successMessage = `Found ${queries.length} ${numQueriesMsg} ${numMachinesMsg}`

    return errors.length > 0 ? (
      <span>
        {successMessage} ({errors.length} unsuccessful)
      </span>
    ) : (
      successMessage
    )
  }

  constructViewFromQueryList(queries: any, errors: any) {
    if (queries.length === 0) {
      return null
    }
    const tableHeaderSizes = [
      ['Database URI', '20%'],
      ['User', '8%'],
      ['Query', 'auto'],
      ['Params', '7%'],
      ['Meta', 'auto'],
      ['Elapsed time', '95px'],
      ['Kill', '95px']
    ]
    const tableRows = queries.map((query: any, i: any) => {
      return (
        <tr key={`rows${i}`}>
          <StyledTd
            key="host"
            title={query.host}
            width={tableHeaderSizes[0][1]}
          >
            <Code>{query.host}</Code>
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
              onConfirmed={this.onCancelQuery.bind(
                this,
                query.host,
                query.queryId
              )}
            />
          </StyledTd>
        </tr>
      )
    })

    const errorRows = errors.map((error: any, i: any) => (
      <tr key={`error${i}`}>
        <StyledTd colSpan={7} title={error.message}>
          <Code>Error connecting to: {error.host}</Code>
        </StyledTd>
      </tr>
    ))

    const tableHeaders = tableHeaderSizes.map(heading => {
      return (
        <StyledTh width={heading[1]} key={heading[0]}>
          {heading[0]}
        </StyledTh>
      )
    })
    return (
      <StyledTableWrapper>
        <StyledTable>
          <thead>
            <StyledHeaderRow>{tableHeaders}</StyledHeaderRow>
          </thead>
          <tbody>
            {tableRows}
            {errorRows}
          </tbody>
        </StyledTable>
      </StyledTableWrapper>
    )
  }

  setAutoRefresh(autoRefresh: any) {
    this.setState({ autoRefresh: autoRefresh })

    if (autoRefresh) {
      this.getRunningQueries()
    }
  }

  render() {
    let frameContents
    let aside
    let statusBar

    if (
      this.props.hasListQueriesProcedure ||
      this.props.connectionState !== CONNECTED_STATE
    ) {
      frameContents = this.constructViewFromQueryList(
        this.state.queries,
        this.state.errors
      )
      statusBar = (
        <StatusbarWrapper>
          {this.state.errors && !this.state.success && (
            <FrameError
              message={(this.state.errors || [])
                .map((e: any) => `${e.host}: ${e.message}`)
                .join(', ')}
            />
          )}
          {this.state.success && (
            <StyledStatusBar>
              {this.state.success}
              <AutoRefreshSpan>
                <AutoRefreshToggle
                  checked={this.state.autoRefresh}
                  onChange={(e: any) => this.setAutoRefresh(e.target.checked)}
                />
              </AutoRefreshSpan>
            </StyledStatusBar>
          )}
        </StatusbarWrapper>
      )
    } else {
      aside = (
        <FrameAside
          title="Frame unavailable"
          subtitle="What edition are you running?"
        />
      )
      frameContents = <EnterpriseOnlyFrame command=":queries" />
    }
    return (
      <FrameBodyTemplate
        isCollapsed={this.props.isCollapsed}
        isFullscreen={this.props.isFullscreen}
        aside={aside}
        contents={frameContents}
        statusBar={statusBar}
      />
    )
  }
}

export default LegacyQueriesFrame
