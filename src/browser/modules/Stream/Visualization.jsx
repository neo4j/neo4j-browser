/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'preact'
import { connect } from 'preact-redux'
import * as grassActions from 'shared/modules/grass/grassDuck'
import bolt from 'services/bolt/bolt'
import { withBus } from 'preact-suber'
import { ExplorerComponent } from '../D3Visualization/components/Explorer'
import { StyledVisContainer } from './styled'
import { getMaxNeighbours, getSettings, shouldAutoComplete } from 'shared/modules/settings/settingsDuck'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

export class Visualization extends Component {
  constructor (props) {
    super(props)

    this.state = {
      nodesAndRelationships: {
        nodes: [],
        relationships: []
      },
      justInitiated: true
    }
  }

  componentWillMount () {
    if (this.props.records && this.props.records.length > 0) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.style !== this.props.style ||
      nextProps.records !== this.props.records ||
      nextProps.graphStyleData !== this.props.graphStyleData
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.records !== this.props.records) {
      this.populateDataToStateFromProps(nextProps)
    }

    if (nextProps.style.display !== this.props.style.display) {
      this.setState({justInitiated: false})
    }
  }

  populateDataToStateFromProps (props) {
    this.setState({ nodesAndRelationships: bolt.extractNodesAndRelationshipsFromRecordsForOldVis(props.records) })
  }

  mergeToList (list1, list2) {
    return list1.concat(list2.filter(itemInList2 => list1.findIndex(itemInList1 => itemInList1.id === itemInList2.id) < 0))
  }

  autoCompleteRelationships (existingNodes, newNodes) {
    if (this.props.autoComplete) {
      const existingNodeIds = existingNodes.map(node => parseInt(node.id))
      const newNodeIds = newNodes.map(node => parseInt(node.id))

      this.getInternalRelationships(existingNodeIds, newNodeIds)
        .then((graph) => {
          this.autoCompleteCallback && this.autoCompleteCallback(graph.relationships)
        })
        .catch((e) => {})
    }
  }

  getNeighbours (id, currentNeighbourIds = []) {
    const query = `MATCH path = (a)--(o)
                   WHERE id(a) = ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN path, size((a)--()) as c
                   ORDER BY id(o)
                   LIMIT ${this.props.maxNeighbours - currentNeighbourIds.length}`
    return new Promise((resolve, reject) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query: query},
        (response) => {
          if (!response.success) {
            reject({nodes: [], rels: []})
          } else {
            let count = response.result.records.length > 0 ? parseInt(response.result.records[0].get('c').toString()) : 0
            const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(response.result.records, false)
            this.autoCompleteRelationships(this.graph._nodes, resultGraph.nodes)
            resolve({...resultGraph, count: count})
          }
        }
      )
    })
  }

  getInternalRelationships (existingNodeIds, newNodeIds) {
    newNodeIds = newNodeIds.map(bolt.neo4j.int)
    existingNodeIds = existingNodeIds.map(bolt.neo4j.int)
    existingNodeIds = existingNodeIds.concat(newNodeIds)
    const query = 'MATCH (a)-[r]->(b) WHERE id(a) IN $existingNodeIds AND id(b) IN $newNodeIds RETURN r;'
    return new Promise((resolve, reject) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query, params: {existingNodeIds, newNodeIds}},
        (response) => {
          if (!response.success) {
            reject({nodes: [], rels: []})
          } else {
            resolve({...bolt.extractNodesAndRelationshipsFromRecordsForOldVis(response.result.records, false)})
          }
        }
      )
    })
  }

  setGraph (graph) {
    this.graph = graph
    this.autoCompleteRelationships([], this.graph._nodes)
  }

  render () {
    // This workaround is to overcome the issue that if the svg is initiated with in a style.display = none component, it does not become visible even display changed to block or so
    if (this.state.justInitiated && this.props.style.display === 'none') {
      return null
    }

    return (
      <StyledVisContainer fullscreen={this.props.fullscreen} style={this.props.style} >
        <ExplorerComponent
          maxNeighbours={this.props.maxNeighbours}
          initialNodeDisplay={this.props.initialNodeDisplay}
          graphStyleData={this.props.graphStyleData}
          updateStyle={this.props.updateStyle}
          getNeighbours={this.getNeighbours.bind(this)}
          nodes={this.state.nodesAndRelationships.nodes}
          relationships={this.state.nodesAndRelationships.relationships}
          fullscreen={this.props.fullscreen}
          frameHeight={this.props.frameHeight}
          assignVisElement={this.props.assignVisElement}
          getAutoCompleteCallback={(callback) => { this.autoCompleteCallback = callback }}
          setGraph={this.setGraph.bind(this)}
        />
      </StyledVisContainer>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    graphStyleData: grassActions.getGraphStyleData(state),
    initialNodeDisplay: getSettings(state).initialNodeDisplay,
    maxNeighbours: getMaxNeighbours(state),
    autoComplete: shouldAutoComplete(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateStyle: (graphStyleData) => {
      dispatch(grassActions.updateGraphStyleData(graphStyleData))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(Visualization))
