import { Component } from 'preact'
import FrameTemplate from '../FrameTemplate'
import { withBus } from 'react-suber'
import { listQueriesProcedure, killQueriesProcedure } from 'shared/modules/cypher/queriesProcedureHelper'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import { RefreshIcon } from 'browser-components/icons/Icons'
import FrameError from '../FrameError'
import FrameSuccess from '../FrameSuccess'

export class QueriesFrame extends Component {
  constructor (props) {
    super(props)

    this.state = {
      queries: [],
      autoRefresh: false,
      autoRefreshInterval: 20 // seconds
    }
  }
  componentDidMount () {
    this.getRunningQueries()
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

  getRunningQueries () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: listQueriesProcedure()},
      (response) => {
        if (response.success) {
          let queries = this.extractQueriesFromBoltResult(response.result)
          this.setState({queries: queries})
        } else {
          let errors = this.state.errors || []
          this.setState({ errors: errors.concat([response.error]) })
        }
      }
    )
  }
  killQueries (queryIdList) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: killQueriesProcedure(queryIdList)},
      (response) => {
        if (response.success) {
          // TODO Get Query Id and user name from response
          this.setState({success: 'Query succefully cancelled'})
          this.getRunningQueries()
        } else {
          let errors = this.state.errors || []
          this.setState({ errors: errors.concat([response.error]) })
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

      return queryInfo
    })
  }

  onCancelQuery (queryId) {
    this.killQueries([ queryId ])
  }

  constructViewFromQueryList (queries) {
    if (queries.length === 0) {
      return null
    }

    const tableRows = queries.map((query) => {
      let databaseUri = query.connectionDetails
      const connectionDetails = query.connectionDetails.split('\t')

      if (connectionDetails.length > 2) {
        const databaseUriDetails = connectionDetails[connectionDetails.length - 2].split('/')
        if (databaseUriDetails.length > 1) {
          databaseUri = connectionDetails[1] + '://' + databaseUriDetails[1].replace(/>$/, '')
        }
      }

      return (
        <tr>
          <td>{databaseUri}</td>
          <td>{query.username}</td>
          <td>{query.query}</td>
          <td>{query.parameters}</td>
          <td>{query.metaData}</td>
          <td>{query.elapsedTime}</td>
          <td><ConfirmationButton onConfirmed={this.onCancelQuery.bind(this, query.queryId)} /></td>
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
    const errors = (this.state.errors) ? this.state.errors.join(', ') : null

    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}>
        <FrameError message={errors} />
        <FrameSuccess message={this.state.success} />
      </FrameTemplate>
    )
  }
}

export default withBus(QueriesFrame)
