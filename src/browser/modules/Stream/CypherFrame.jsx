import React from 'react'
import FrameTitlebar from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import asciitable from 'ascii-data-table'
import QueryPlan from './Planner/QueryPlan'
import bolt from 'services/bolt/bolt'
import Visualization from './Visualization'

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

  shouldComponentUpdate (nextProps) {
    return nextProps.frame.result !== this.props.frame.result
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.frame.result !== this.props.frame.result) {
      this.state.rows = bolt.recordsToTableArray(nextProps.frame.result.records)
      this.state.plan = bolt.extractPlan(nextProps.frame.result)
    }
  }

  render () {
    const frame = this.props.frame
    const errors = frame.error && frame.error.fields || false
    const result = frame.result || false
    const plan = this.state.plan || bolt.extractPlan(result)

    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    if (result.records && result.records.length > 0) {
      if (plan) {
        frameContents = <QueryPlan plan={plan} />
      } else {
        this.state.rows = this.state.rows || bolt.recordsToTableArray(result.records)
        frameContents = (<div>
          <Visualization records={result.records} />
          <pre>{asciitable.table(this.state.rows)}</pre>
        </div>)
      }
    } else if (errors) {
      frameContents = (
        <div>
          {errors[0].code}
          <pre>{errors[0].message}</pre>
        </div>
      )
    } else if (result) {
      frameContents = (
        <div>
          <pre>{JSON.stringify(frame, null, '\t')}</pre>
        </div>
      )
    }
    return (
      <FrameTemplate
        header={<FrameTitlebar frame={frame} />}
        contents={frameContents}
      />
    )
  }
}
export default CypherFrame
