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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import FrameTemplate from '../FrameTemplate'
import bolt from 'services/bolt/bolt'
import {
  listQueriesProcedure,
  killQueriesProcedure
} from 'shared/modules/cypher/queriesProcedureHelper'
import { getAvailableProcedures } from 'shared/modules/features/featuresDuck'
import {
  CYPHER_REQUEST,
  CLUSTER_CYPHER_REQUEST,
  AD_HOC_CYPHER_REQUEST
} from 'shared/modules/cypher/cypherDuck'
import {
  getConnectionState,
  CONNECTED_STATE
} from 'shared/modules/connections/connectionsDuck'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import {
  StyledTh,
  StyledHeaderRow,
  StyledTable,
  StyledTableWrapper,
  StyledTd,
  Code
} from './styled'
import {
  StyledStatusBar,
  AutoRefreshToggle,
  RefreshQueriesButton,
  AutoRefreshSpan,
  StatusbarWrapper
} from '../AutoRefresh/styled'
import { EnterpriseOnlyFrame } from 'browser-components/EditionView'
import { RefreshIcon } from 'browser-components/icons/Icons'
import Render from 'browser-components/Render'
import FrameError from '../FrameError'

export class QueriesFrame extends Component {
  constructor (props) {
    super(props)

    this.state = {
      queries: [],
      autoRefresh: false,
      autoRefreshInterval: 20, // seconds
      success: null,
      errors: null
    }
  }

  componentDidMount () {
    if (this.props.connectionState === CONNECTED_STATE) {
      this.getRunningQueries()
    } else {
      this.setState({ errors: ['Unable to connect to bolt server'] })
    }
  }

  componentDidUpdate (prevProps, prevState) {
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
  }

  isCC () {
    return this.props.availableProcedures.includes('dbms.cluster.overview')
  }
  canListQueries () {
    return this.props.availableProcedures.includes('dbms.listQueries')
  }

  getRunningQueries (suppressQuerySuccessMessage = false) {
    this.props.bus.self(
      this.isCC() ? CLUSTER_CYPHER_REQUEST : CYPHER_REQUEST,
      { query: listQueriesProcedure() },
      response => {
        if (response.success) {
          const queries = this.extractQueriesFromBoltResult(response.result)
          const errors = queries.filter(_ => _.error).map(e => ({ ...e.error }))
          const validQueries = queries.filter(_ => !_.error)
          const resultMessage = this.constructOverviewMessage(
            validQueries,
            errors
          )

          this.setState((prevState, props) => {
            return {
              queries: validQueries,
              errors,
              success: suppressQuerySuccessMessage
                ? prevState.success
                : resultMessage
            }
          })
        } else {
          const errors = this.state.errors || []
          this.setState({
            errors: errors.concat([response.error]),
            success: false
          })
        }
      }
    )
  }

  killQueries (host, queryIdList) {
    this.props.bus.self(
      this.isCC() ? AD_HOC_CYPHER_REQUEST : CYPHER_REQUEST,
      { host, query: killQueriesProcedure(queryIdList) },
      response => {
        if (response.success) {
          this.setState({
            success: 'Query successfully cancelled',
            errors: null
          })
          this.getRunningQueries(true)
        } else {
          const errors = this.state.errors || []
          this.setState({
            errors: errors.concat([response.error]),
            success: false
          })
        }
      }
    )
  }

  extractQueriesFromBoltResult (result) {
    return result.records.map(({ keys, _fields, host, error }) => {
      if (error) {
        return { error }
      }
      const queryInfo = {}
      keys.forEach((key, idx) => {
        queryInfo[key] = bolt.itemIntToNumber(_fields[idx])
      })
      if (host) {
        queryInfo.host = 'bolt://' + host
      } else {
        queryInfo.host = 'bolt://' + result.summary.server.address
      }
      return queryInfo
    })
  }

  onCancelQuery (host, queryId) {
    this.killQueries(host, [queryId])
  }

  constructOverviewMessage (queries, errors) {
    const clusterCount = new Set(queries.map(query => query.host)).size

    const numMachinesMsg =
      clusterCount > 1
        ? `running on ${clusterCount} cluster servers`
        : 'running on one server'

    const numQueriesMsg = queries.length > 1 ? 'queries' : 'query'

    const successMessage = `Found ${
      queries.length
    } ${numQueriesMsg} ${numMachinesMsg}`

    return errors.length > 0 ? (
      <span>
        {successMessage} ({errors.length} unsuccessful)
      </span>
    ) : (
      successMessage
    )
  }

  constructViewFromQueryList (queries, errors) {
    if (queries.length === 0) {
      return null
    }
    const tableHeaderSizes = [
      ['Database URI', '20%'],
      ['User', '8%'],
      ['Query', 'auto'],
      ['Params', '7%'],
      ['Meta', '8%'],
      ['Elapsed time', '95px'],
      ['Kill', '95px']
    ]
    const tableRows = queries.map((query, i) => {
      return (
        <tr key={`rows${i}`}>
          <StyledTd
            key='host'
            title={query.host}
            width={tableHeaderSizes[0][1]}
          >
            <Code>{query.host}</Code>
          </StyledTd>
          <StyledTd key='username' width={tableHeaderSizes[1][1]}>
            {query.username}
          </StyledTd>
          <StyledTd
            key='query'
            title={query.query}
            width={tableHeaderSizes[2][1]}
          >
            <Code>{query.query}</Code>
          </StyledTd>
          <StyledTd key='params' width={tableHeaderSizes[3][1]}>
            <Code>{JSON.stringify(query.parameters, null, 2)}</Code>
          </StyledTd>
          <StyledTd key='meta' width={tableHeaderSizes[4][1]}>
            <Code>{JSON.stringify(query.metaData, null, 2)}</Code>
          </StyledTd>
          <StyledTd key='time' width={tableHeaderSizes[5][1]}>
            {query.elapsedTimeMillis} ms
          </StyledTd>
          <StyledTd key='actions' width={tableHeaderSizes[6][1]}>
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

    const errorRows = errors.map((error, i) => (
      <tr key={`error${i}`}>
        <StyledTd colSpan='7' title={error.message}>
          <Code>Error connecting to: {error.host}</Code>
        </StyledTd>
      </tr>
    ))

    const tableHeaders = tableHeaderSizes.map((heading, i) => {
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

  setAutoRefresh (autoRefresh) {
    this.setState({ autoRefresh: autoRefresh })

    if (autoRefresh) {
      this.getRunningQueries()
    }
  }

  render () {
    let frameContents
    let statusbar

    if (this.canListQueries()) {
      frameContents = this.constructViewFromQueryList(
        this.state.queries,
        this.state.errors
      )
      statusbar = (
        <StatusbarWrapper>
          <Render if={this.state.errors && !this.state.success}>
            <FrameError
              message={(this.state.errors || [])
                .map(e => `${e.host}: ${e.message}`)
                .join(', ')}
            />
          </Render>
          <Render if={this.state.success}>
            <StyledStatusBar>
              {this.state.success}
              <RefreshQueriesButton onClick={() => this.getRunningQueries()}>
                <RefreshIcon />
              </RefreshQueriesButton>
              <AutoRefreshSpan>
                <AutoRefreshToggle
                  checked={this.state.autoRefresh}
                  onChange={e => this.setAutoRefresh(e.target.checked)}
                />
              </AutoRefreshSpan>
            </StyledStatusBar>
          </Render>
        </StatusbarWrapper>
      )
    } else {
      frameContents = <EnterpriseOnlyFrame command={this.props.frame.cmd} />
    }
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}
        statusbar={statusbar}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    availableProcedures: getAvailableProcedures(state) || [],
    connectionState: getConnectionState(state)
  }
}

export default withBus(
  connect(
    mapStateToProps,
    null
  )(QueriesFrame)
)
