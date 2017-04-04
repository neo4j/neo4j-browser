import { Component } from 'preact'
import {createGraph, mapNodes, mapRelationships, getGraphStats} from '../mapper'
import {GraphEventHandler} from '../GraphEventHandler'
import '../lib/visualization/index'

export class GraphComponent extends Component {

  graphInit (el) {
    this.state.el = el
  }

  componentDidMount () {
    if (this.state.el != null) {
      if (!this.graphView) {
        let NeoConstructor = neo.graphView
        let measureSize = () => { return {width: this.state.el.offsetWidth, height: this.state.el.parentNode.offsetHeight} }
        this.graph = createGraph(this.props.nodes, this.props.relationships)
        this.graphView = new NeoConstructor(this.state.el, measureSize, this.graph, this.props.graphStyle)
        new GraphEventHandler(this.graph,
          this.graphView,
          this.props.getNodeNeighbours,
          this.props.onItemMouseOver,
          this.props.onItemSelect,
          this.props.onGraphModelChange
        ).bindEventHandlers()
        this.graphView.resize()
        this.graphView.update()
        this.state.currentStyleRules = this.props.graphStyle.toString()
        this.props.onGraphModelChange(getGraphStats(this.graph))
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if ((nextProps.relationships !== this.props.relationships || nextProps.nodes !== this.props.nodes) && this.graphView !== undefined) {
      this.graph.resetGraph()
      this.graph.addNodes(mapNodes(nextProps.nodes))
      this.graph.addRelationships(mapRelationships(nextProps.relationships, this.graph))
    } else if (this.state.currentStyleRules !== nextProps.graphStyle.toString()) {
      this.graphView.update()
      this.state.currentStyleRules = nextProps.graphStyle.toString()
    }
  }

  render () {
    return (
      <svg className='neod3viz' ref={this.graphInit.bind(this)} />
    )
  }
}
