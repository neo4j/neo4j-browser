import React from 'react'
import '../visualisation.css'
import '../external/neod3.js'
import '../external/graphStyle.js'
import {mapBoltRecordsToGraph} from '../mapper'

export default class GraphComponent extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      graph: mapBoltRecordsToGraph(props.records)
    }
  }

  graphInit (el) {
    if (el != null) {
      let NeoConstructor = neo.graphView
      let measureSize = () => { return {width: el.offsetWidth, height: el.parentNode.offsetHeight} }
      let graphView = new NeoConstructor(el, measureSize, this.state.graph, neo.graphstyle)
      graphView.resize()
      graphView.update()
    }
  }

  render () {
    return (
      <svg className='neod3viz' ref={this.graphInit.bind(this)}>
      </svg>
    )
  }
}
