import React from 'react'
import '../visualisation.css'
import '../external/neod3.js'
import '../external/graphStyle.js'
import {createGraph, mapNodes, mapRelationships} from '../mapper'

export default class GraphComponent extends React.Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  graphInit (el) {
    if (el != null) {
      if (!this.state.graphView) {
        let NeoConstructor = neo.graphView
        let measureSize = () => { return {width: el.offsetWidth, height: el.parentNode.offsetHeight} }
        this.state.graph = createGraph(this.props.nodes, this.props.relationships)
        this.state.graphView = new NeoConstructor(el, measureSize, this.state.graph, neo.graphstyle)
        this.state.graphView.resize()
      } else {
        this.state.graph.addNodes(mapNodes(this.props.nodes))
        this.state.graph.addRelationships(mapRelationships(this.props.relationships, this.state.graph))
      }
      this.state.graphView.update()
    }
  }

  render () {
    return (
      <svg className='neod3viz' ref={this.graphInit.bind(this)}>
      </svg>
    )
  }
}
