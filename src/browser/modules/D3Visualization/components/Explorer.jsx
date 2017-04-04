import { Component } from 'preact'
import neo4jVisualization from 'neo4j-visualization-d3'
import {InspectorComponent} from './Inspector'
import {LegendComponent} from './Legend'
import {StyledSvgWrapper} from './styled'

export class ExplorerComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state.stats = {labels: {}, relTypes: {}}
    this.state.graphStyle = neo4jVisualization.neoGraphStyle()
    if (this.props.graphStyleData) {
      this.state.graphStyle.loadRules(this.props.graphStyleData)
    }
  }

  getNodeNeighbours (node, callback) {
    this.props.getNeighbours(node.id).then((result) => {
      callback({nodes: result.nodes, relationships: result.relationships})
    })
  }

  onItemMouseOver (item) {
    this.setState({hoveredItem: item})
  }

  onItemSelect (item) {
    this.setState({selectedItem: item})
  }

  onGraphModelChange (stats) {
    this.setState({stats: stats})
    this.props.updateStyle(this.state.graphStyle.toSheet())
  }

  onSelectedLabel (label, propertyKeys) {
    this.setState({selectedItem: {type: 'legend-item', item: {selectedLabel: {label: label, propertyKeys: propertyKeys}, selectedRelType: null}}})
  }

  onSelectedRelType (relType, propertyKeys) {
    this.setState({selectedItem: {type: 'legend-item', item: {selectedLabel: null, selectedRelType: {relType: relType, propertyKeys: propertyKeys}}}})
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.graphStyleData !== this.props.graphStyleData && nextProps.graphStyleData) {
      this.state.graphStyle.loadRules(nextProps.graphStyleData)
      this.setState({graphStyle: this.state.graphStyle})
    }
  }

  render () {
    return (
      <div id='svg-vis'>
        <LegendComponent stats={this.state.stats} graphStyle={this.state.graphStyle} onSelectedLabel={this.onSelectedLabel.bind(this)} onSelectedRelType={this.onSelectedRelType.bind(this)} />
        <StyledSvgWrapper className={Object.keys(this.state.stats.relTypes).length ? '' : 'one-legend-row'}>
          <neo4jVisualization.GraphComponent {...this.props} getNodeNeighbours={this.getNodeNeighbours.bind(this)} onItemMouseOver={this.onItemMouseOver.bind(this)} onItemSelect={this.onItemSelect.bind(this)} graphStyle={this.state.graphStyle} onGraphModelChange={this.onGraphModelChange.bind(this)} />
        </StyledSvgWrapper>
        <InspectorComponent hoveredItem={this.state.hoveredItem} selectedItem={this.state.selectedItem} graphStyle={this.state.graphStyle} />
      </div>
    )
  }
}
export const Explorer = ExplorerComponent
