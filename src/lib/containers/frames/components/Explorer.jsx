import React from 'react'
import neo4jVisualization from 'neo4j-visualization'
import {InspectorComponent} from './Inspector'
import bolt from '../../../../services/bolt/bolt'

export class ExplorerComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.graphStyle = neo4jVisualization.neoGraphStyle()
  }

  getNodeNeighbours (node, callback) {
    const neighbourCypher = `MATCH path = (a)--(o)
            WHERE id(a)= ${node.id}
            RETURN path, size((a)--()) as c
            ORDER BY id(o)
            LIMIT 100`
    bolt.transaction(neighbourCypher).then((result) => {
      callback(bolt.extractNodesAndRelationshipsFromRecords(result.records))
    })
  }

  onItemMouseOver (item) {
    this.setState({hoveredItem: item})
  }

  render () {
    return (
      <div>
        <neo4jVisualization.GraphComponent {...this.props} getNodeNeighbours={this.getNodeNeighbours.bind(this)} onItemMouseOver={this.onItemMouseOver.bind(this)} graphStyle={this.graphStyle}/>
        <InspectorComponent hoveredItem={this.state.hoveredItem} graphStyle={this.graphStyle} />
      </div>
    )
  }
}
