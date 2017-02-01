import React from 'react'
import { initialise } from '../../../../node_modules/neo4j-visualization/dist/neo4j-visualization.js'
import bolt from 'services/bolt/bolt'
import styles from './style_cypher.css'

class Visualization extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.records !== this.props.records
  }

  componentWillReceiveProps (nextProps) {
    this.state.nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(nextProps.records)
  }

  getNeighbours (id) {
    return new Promise((resolve, reject) => {
      var p = bolt.transaction(`MATCH path = (a)-[r]-(o) WHERE id(a)= ${id} RETURN r, o`)
      p.then((r) => {
        bolt.recordsToTableArray(r.records)
        const nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(r.records)
        resolve({nodes: nodesAndRelationships.nodes, rels: nodesAndRelationships.relationships})
      })
    })
  }

  initialiseVis (el) {
    const getNeighbours = (id) => {
      return new Promise((resolve, reject) => {
        var p = bolt.transaction(`MATCH path = (a)-[r]-(o) WHERE id(a)= ${id} RETURN r, o`)
        p.then((r) => {
          bolt.recordsToTableArray(r.records)
          const nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(r.records)
          resolve({nodes: nodesAndRelationships.nodes, rels: nodesAndRelationships.relationships})
        })
      })
    }
    if (el) {
      initialise(el, this.state.nodesAndRelationships.nodes, this.state.nodesAndRelationships.relationships, {}, { getNeighbours: getNeighbours })
    }
  }
  render () {
    this.state.nodesAndRelationships = this.state.nodesAndRelationships || bolt.extractNodesAndRelationshipsFromRecords(this.props.records)
    return (<div className={styles.nevadaCanvas} ref={this.initialiseVis.bind(this)} />)
  }
}
export default Visualization
