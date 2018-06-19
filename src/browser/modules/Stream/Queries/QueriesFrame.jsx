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
          let queries = this.extractQueriesFromBoltResult(response.result)
          let resultMessage = this.constructSuccessMessage(queries)

          this.setState((prevState, props) => {
            return {
              queries: queries,
              errors: null,
              success: suppressQuerySuccessMessage
                ? prevState.success
                : resultMessage
            }
          })
        } else {
          let errors = this.state.errors || []
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
          let errors = this.state.errors || []
          this.setState({
            errors: errors.concat([response.error]),
            success: false
          })
        }
      }
    )
  }

  extractQueriesFromBoltResult (result) {
    return result.records.map(queryRecord => {
      let queryInfo = {}
      queryRecord.keys.forEach((key, idx) => {
        queryInfo[key] = bolt.itemIntToNumber(queryRecord._fields[idx])
      })
      if (queryRecord.host) {
        queryInfo.host = 'bolt://' + queryRecord.host
      } else {
        queryInfo.host = 'bolt://' + result.summary.server.address
      }
      return queryInfo
    })
  }

  onCancelQuery (host, queryId) {
    this.killQueries(host, [queryId])
  }

  constructSuccessMessage (queries) {
    let hosts = queries.map(query => query.host).reduce((acc, host) => {
      if (acc.host) {
        return acc
      } else {
        acc[host] = 1
        return acc
      }
    }, {})

    let clusterCount = Object.keys(hosts).map(key => hosts.hasOwnProperty(key))
      .length
    let numMachinesMsg = 'running on one server'

    if (clusterCount > 1) {
      numMachinesMsg = `running on ${clusterCount} cluster servers`
    }

    let numQueriesMsg = queries.length > 1 ? 'queries' : 'query'

    return `Found ${queries.length} ${numQueriesMsg} ${numMachinesMsg}`
  }

  constructViewFromQueryList (queries) {
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
    const tableRows = queries.map(query => {
      return (
        <tr key='rows'>
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
          <tbody>{tableRows}</tbody>
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
      frameContents = this.constructViewFromQueryList(this.state.queries)
      statusbar = (
        <StatusbarWrapper>
          <Render if={this.state.errors}>
            <FrameError message={(this.state.errors || []).join(', ')} />
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
                  onClick={e => this.setAutoRefresh(e.target.checked)}
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

export default withBus(connect(mapStateToProps, null)(QueriesFrame))
