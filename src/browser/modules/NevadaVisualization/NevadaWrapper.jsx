import { Component } from 'preact'

export class NevadaWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  getNeighbours (id) {
    let promise = this.props.getNeighbours(id)
    const mapRecords = (result) => {
      return new Promise((resolve, reject) => {
        resolve({nodes: result.nodes, rels: result.relationships})
      })
    }
    return promise.then(mapRecords)
  }

  componentWillUnmount () {
    if (this.state.nevada) {
      this.state.nevada.destroy()
    }
  }

  fetchLabels () {
    return this.props.labels
  }

  labelsUpdated (labels) {
    return this.props.onLabelsSave(labels)
  }

  componentDidMount () {
    if (this.state.parentContainer) {
      const callbacks = {
        getNeighbours: this.getNeighbours.bind(this),
        labelsUpdated: this.labelsUpdated.bind(this),
        fetchLabels: this.fetchLabels.bind(this)
      }
      require.ensure([], (require) => {
        const Nevada = require('neo4j-visualization').default
        this.state.nevada = new Nevada(this.state.parentContainer, this.props.nodes, this.props.relationships, {}, callbacks)
      }, 'nevada')
    }
  }

  initialiseVis (el) {
    if (el) {
      this.state.parentContainer = el
    }
  }
  render () {
    return (<div className='nevada-canvas' ref={this.initialiseVis.bind(this)} />)
  }
}
