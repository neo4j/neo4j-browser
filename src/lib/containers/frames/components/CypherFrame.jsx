import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import asciitable from 'ascii-data-table'
import bolt from 'services/bolt/bolt'
import visualization from 'containers/visualization'
import neo4jVisualization from 'neo4j-visualization'
import { Card } from 'material-ui/Card'

import styles from './style_cypher.css'

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
  renderPlan (plan) {
    return (
      <div className={styles.plan}>
        <div className={styles.planSvg}>
          <neo4jVisualization.QueryPlanComponent plan={plan}/>
        </div>
      </div>
    )
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.frame.result !== this.props.frame.result) {
      this.state.nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(nextProps.frame.result.records)
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
      this.state.nodesAndRelationships = this.state.nodesAndRelationships || bolt.extractNodesAndRelationshipsFromRecords(result.records)
      if (this.state.nodesAndRelationships.nodes.length > 0) {
        if (plan) {
          const style = {'margin-bottom': '20px'}
          frameContents = (
            <div>
              <Card className={styles.svg} containerStyle={style}>
                <visualization.components.Explorer useContextMenu nodes={this.state.nodesAndRelationships.nodes} relationships={this.state.nodesAndRelationships.relationships}/>
              </Card>
              <Card>
                {this.renderPlan(plan)}
              </Card>
            </div>
          )
        } else {
          frameContents = (
            <Card className={styles.svg}>
              <visualization.components.Explorer useContextMenu nodes={this.state.nodesAndRelationships.nodes} relationships={this.state.nodesAndRelationships.relationships}/>
            </Card>
          )
        }
      } else {
        this.state.rows = this.state.rows || bolt.recordsToTableArray(result.records)
        frameContents = <pre>{asciitable.run(this.state.rows)}</pre>
      }
    } else if (errors) {
      frameContents = (
        <div>
          {errors[0].code}
          <pre>{errors[0].message}</pre>
        </div>
      )
    } else if (plan) {
      frameContents = this.renderPlan(plan)
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

export {
  CypherFrame
}
