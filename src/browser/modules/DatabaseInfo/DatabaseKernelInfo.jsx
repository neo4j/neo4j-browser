import { Component } from 'preact'
import { withBus } from 'react-suber'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

export class DatabaseKernelInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      databaseKernelInfo: props.databaseKernelInfo
    }
  }
  componentWillReceiveProps (props) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: 'CALL dbms.components()'},
      (response) => {
        if (response.success) {
          const result = response.result
          this.setState({
            databaseKernelInfo: {
              version: result.records[0].get('versions'),
              edition: result.records[0].get('edition')
            }
          })
        }
      }
    )
  }
  render () {
    const databaseKernelInfo = this.state.databaseKernelInfo
    if (databaseKernelInfo) {
      return (
        <div className='database-kernel-info'>
          <h4>Database</h4>
          <div>Version: <span className='version'>{databaseKernelInfo.version}</span></div>
          <div>Edition: <span className='edition'>{databaseKernelInfo.edition}</span></div>
        </div>
      )
    } else {
      return null
    }
  }
}
export default withBus(DatabaseKernelInfo)
