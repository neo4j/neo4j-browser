import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
// import asciitable from 'ascii-data-table'
import bolt from '../../../services/bolt/bolt'
// import tabNavigation from '../../../tabNavigation'
import GraphComponent from '../../../visualisation/components/Graph'

class CypherFrame extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: 'text'
    }
  }

  onNavClick (viewName) {
    this.setState({openView: viewName})
  }
  render () {
    const frame = this.props.frame
    const errors = frame.errors && frame.errors.fields || false
    const result = frame.result || false
    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    if (result) {
      const nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(result.records)
      frameContents = (
        <div className='frame'>
          <GraphComponent nodes={nodesAndRelationships.nodes} relationships={nodesAndRelationships.relationships}/>
        </div>
      )

      // const rows = bolt.recordsToTableArray(result.records)
      // frameContents = <pre>{asciitable.run(rows)}</pre>
    } else if (errors) {
      frameContents = (
        <div>
          {errors[0].code}
          <pre>{errors[0].message}</pre>
        </div>
      )
    }
    return (
      <div className='frame'>
        <FrameTitlebar frame={frame} />
        <div className='frame-contents'>{frameContents}</div>
      </div>
    )
  }
}

export {
  CypherFrame
}
