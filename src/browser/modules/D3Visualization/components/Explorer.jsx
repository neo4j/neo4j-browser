import { Component } from 'preact'
import neo4jVisualization from 'neo4j-visualization-d3'
import {InspectorComponent} from './Inspector'
import {LegendComponent} from './Legend'
import {StyledSvgWrapper} from './styled'

// import { connect } from 'react-redux'
// import { getGraphStyleData } from '../reducer'

export class ExplorerComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state.stats = {labels: {}, relTypes: {}}
    this.graphStyle = neo4jVisualization.neoGraphStyle()
    this.graphStyle.loadRules('node {diameter: 50px;color: #A5ABB6;border-color: #9AA1AC;border-width: 2px;text-color-internal: #FFFFFF;font-size: 10px;}relationship {color: #A5ABB6; shaft-width: 1px; font-size: 8px;padding: 3px;text-color-external: #000000;text-color-internal: #FFFFFF; caption: \'<type>\';}')
  }

  getNodeNeighbours (node, callback) {
    this.props.getNeighbours(node.id).then((result) => {
      callback({nodes: result.nodes, relationships: result.rels})
    })
  }

  onItemMouseOver (item) {
    this.setState({hoveredItem: item})
  }

  onGraphModelChange (stats) {
    this.setState({stats: stats})
  }

  render () {
    return (
      <div id='svg-vis'>
        <LegendComponent stats={this.state.stats} graphStyle={this.graphStyle} />
        <StyledSvgWrapper>
          <neo4jVisualization.GraphComponent {...this.props} getNodeNeighbours={this.getNodeNeighbours.bind(this)} onItemMouseOver={this.onItemMouseOver.bind(this)} graphStyle={this.graphStyle} onGraphModelChange={this.onGraphModelChange.bind(this)} />
        </StyledSvgWrapper>
        <InspectorComponent hoveredItem={this.state.hoveredItem} graphStyle={this.graphStyle} />
      </div>
    )
  }
}

// const mapStateToProps = (state) => {
//   return {
//     graphStyleData: getGraphStyleData(state)
//   }
// }

export const Explorer = ExplorerComponent
