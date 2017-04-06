/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { Component } from 'preact'
import FrameTemplate from '../FrameTemplate'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { listQueriesProcedure, killQueriesProcedure } from 'shared/modules/cypher/queriesProcedureHelper'
import { getAvailableProcedures } from 'shared/modules/features/featuresDuck'
import { CYPHER_REQUEST, CLUSTER_CYPHER_REQUEST, AD_HOC_CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { getConnectionState, CONNECTED_STATE } from 'shared/modules/connections/connectionsDuck'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import { StyledTh, StyledHeaderRow, StyledTable, StyledTd, Code } from './styled'
import { RefreshIcon } from 'browser-components/icons/Icons'
import Visible from 'browser-components/Visible'
import FrameError from '../FrameError'
import FrameSuccess from '../FrameSuccess'

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
      this.setState({errors: ['Unable to connect to bolt server']})
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.autoRefresh !== this.state.autoRefresh) {
      if (this.state.autoRefresh) {
        this.timer = setInterval(this.getRunningQueries.bind(this), this.state.autoRefreshInterval * 1000)
      } else {
        clearInterval(this.timer)
      }
    }
  }
  isCC () {
    return this.props.availableProcedures.includes('dbms.cluster.overview')
  }
  getRunningQueries (clearSuccess = true) {
    this.props.bus.self(
      (this.isCC()) ? CLUSTER_CYPHER_REQUEST : CYPHER_REQUEST,
      {query: listQueriesProcedure()},
      (response) => {
        if (response.success) {
          let queries = this.extractQueriesFromBoltResult(response.result)
          this.setState((prevState, props) => {
            return { queries: queries, errors: null, success: clearSuccess ? null : prevState.success }
          })
        } else {
          let errors = this.state.errors || []
          this.setState({ errors: errors.concat([response.error]), success: false })
        }
      }
    )
  }
  killQueries (host, queryIdList) {
    this.props.bus.self(
      (this.isCC()) ? AD_HOC_CYPHER_REQUEST : CYPHER_REQUEST,
      {host, query: killQueriesProcedure(queryIdList)},
      (response) => {
        if (response.success) {
          this.setState({success: 'Query successfully cancelled', errors: null})
          this.getRunningQueries(false)
        } else {
          let errors = this.state.errors || []
          this.setState({ errors: errors.concat([response.error]), success: false })
        }
      }
    )
  }
  extractQueriesFromBoltResult (result) {
    return result.records.map((queryRecord) => {
      let queryInfo = {}
      queryRecord.keys.forEach((key, idx) => {
        queryInfo[key] = queryRecord._fields[idx]
      })
      if (queryInfo.host) {
        queryInfo.host = 'bolt://' + queryInfo.host
      } else {
        queryInfo.host = 'bolt://' + result.summary.server.address
      }
      return queryInfo
    })
  }

  onCancelQuery (host, queryId) {
    this.killQueries(host, [ queryId ])
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
    const tableRows = queries.map((query) => {
      return (
        <tr>
          <StyledTd title={query.host} width={tableHeaderSizes[0][1]}><Code>{query.host}</Code></StyledTd>
          <StyledTd width={tableHeaderSizes[1][1]}>{query.username}</StyledTd>
          <StyledTd title={query.query} width={tableHeaderSizes[2][1]}><Code>{query.query}</Code></StyledTd>
          <StyledTd width={tableHeaderSizes[3][1]}><Code>{query.parameters}</Code></StyledTd>
          <StyledTd width={tableHeaderSizes[4][1]}><Code>{query.metaData}</Code></StyledTd>
          <StyledTd width={tableHeaderSizes[5][1]}>{query.elapsedTime}</StyledTd>
          <StyledTd width={tableHeaderSizes[6][1]}><ConfirmationButton onConfirmed={this.onCancelQuery.bind(this, query.host, query.queryId)} /></StyledTd>
        </tr>)
    })

    const tableHeaders = tableHeaderSizes.map((heading, i) => {
      return <StyledTh width={heading[1]} key={i}>{heading[0]}</StyledTh>
    })
    return (
      <StyledTable>
        <thead>
          <StyledHeaderRow>
            {tableHeaders}
          </StyledHeaderRow>
        </thead>
        <tbody>
          {tableRows}
          <tr>
            <td>
              <input type='checkbox' id='autoRefreshChk' onClick={(e) => this.setState({ autoRefresh: e.target.checked })} checked={this.state.autoRefresh} />
              <label for='autoRefreshChk'>Auto Refresh</label>
            </td>
            <td>
              <button onClick={() => this.getRunningQueries()}><RefreshIcon /></button>
            </td>
          </tr>
        </tbody>
      </StyledTable>
    )
  }
  render () {
    const frameContents = this.constructViewFromQueryList(this.state.queries)
    const statusbar = (
      <div>
        <Visible if={this.state.errors}>
          <FrameError message={(this.state.errors || []).join(', ')} />
        </Visible>
        <Visible if={this.state.success}>
          <FrameSuccess message={this.state.success} />
        </Visible>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}
        statusbar={statusbar}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    availableProcedures: getAvailableProcedures(state) || [],
    connectionState: getConnectionState(state)
  }
}

export default withBus(connect(mapStateToProps, null)(QueriesFrame))
