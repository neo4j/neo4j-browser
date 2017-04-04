import { Component } from 'preact'
import FrameTemplate from '../FrameTemplate'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { listQueriesProcedure, killQueriesProcedure } from 'shared/modules/cypher/queriesProcedureHelper'
import { getAvailableProcedures } from 'shared/modules/features/featuresDuck'
import { CYPHER_REQUEST, CLUSTER_CYPHER_REQUEST, AD_HOC_CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { getConnectionState, CONNECTED_STATE } from 'shared/modules/connections/connectionsDuck'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
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

    const tableRows = queries.map((query) => {
      return (
        <tr>
          <td>{query.host}</td>
          <td>{query.username}</td>
          <td>{query.query}</td>
          <td>{query.parameters}</td>
          <td>{query.metaData}</td>
          <td>{query.elapsedTime}</td>
          <td><ConfirmationButton onConfirmed={this.onCancelQuery.bind(this, query.host, query.queryId)} /></td>
        </tr>)
    })

    const tableHeaders = ['Database URI', 'User', 'Query', 'Params', 'Meta', 'Elapsed time', 'Kill'].map((heading, i) => {
      return <th key={i}>{heading}</th>
    })
    return (
      <table>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
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
      </table>
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
