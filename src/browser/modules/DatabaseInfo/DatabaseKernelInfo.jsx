import React from 'react'
import bolt from 'services/bolt/bolt'

export default class DatabaseKernelInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      databaseKernelInfo: props.databaseKernelInfo
    }
  }
  componentWillReceiveProps (props) {
    bolt.transaction('CALL dbms.components()').then(r => {
      this.setState({
        databaseKernelInfo: {
          version: r.records[0].get('versions'),
          edition: r.records[0].get('edition')
        }
      })
    }).catch(_ => console.log('CALL dbms.components() failed', _))
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
