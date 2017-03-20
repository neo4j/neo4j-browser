import { Component } from 'preact'
import { connect } from 'preact-redux'
import * as actions from 'shared/modules/visualization/visualizationDuck'
import Nevada from 'neo4j-visualization'
import bolt from 'services/bolt/bolt'
import { withBus } from 'preact-suber'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import styles from './style_cypher.css'

export class Visualization extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.records !== this.props.records
  }
  componentWillUnmount () {
    if (this.state.nevada) {
      this.state.nevada.destroy()
    }
  }
  componentWillReceiveProps (nextProps) {
    this.state.nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(nextProps.records)
  }

  getNeighbours (id) {
    return new Promise((resolve, reject) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query: `MATCH path = (a)-[r]-(o) WHERE id(a)= ${id} RETURN r, o`},
        (response) => {
          if (!response.success) return reject({nodes: [], rels: []})

          const result = response.result
          bolt.recordsToTableArray(result.records)
          const nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(result.records)
          resolve({nodes: nodesAndRelationships.nodes, rels: nodesAndRelationships.relationships})
        }
      )
    })
  }

  fetchLabels () {
    return this.props.labels
  }

  labelsUpdated (labels) {
    return this.props.onLabelsSave(labels)
  }

  initialiseVis (el) {
    if (el) {
      const callbacks = {
        getNeighbours: this.getNeighbours.bind(this),
        labelsUpdated: this.labelsUpdated.bind(this),
        fetchLabels: this.fetchLabels.bind(this)
      }
      this.state.nevada = new Nevada(el, this.state.nodesAndRelationships.nodes, this.state.nodesAndRelationships.relationships, {}, callbacks)
    }
  }
  render () {
    this.state.nodesAndRelationships = this.state.nodesAndRelationships || bolt.extractNodesAndRelationshipsFromRecords(this.props.records)
    return (<div className={styles.nevadaCanvas} ref={this.initialiseVis.bind(this)} />)
  }
}

const mapStateToProps = (state) => {
  return {
    labels: actions.getLabels(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLabelsSave: (labels) => {
      dispatch(actions.update(labels))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(Visualization))
