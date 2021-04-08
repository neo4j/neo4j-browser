/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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

import neo4j from 'neo4j-driver'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deepEquals } from 'services/utils'
import * as grassActions from 'shared/modules/grass/grassDuck'
import bolt from 'services/bolt/bolt'
import { withBus } from 'react-suber'
import { ExplorerComponent } from '../../D3Visualization/components/Explorer'
import { StyledVisContainer } from './VisualizationView.styled'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { getMaxFieldItems } from 'shared/modules/settings/settingsDuck'
import { resultHasTruncatedFields } from 'browser/modules/Stream/CypherFrame/helpers'
import { Bus } from 'suber'

type VisualizationState = {
  updated: number
  nodes: any[]
  relationships: any[]
  hasTruncatedFields: boolean
}

type VisualizationProps = {
  result: any
  graphStyleData: any
  frameHeight: string
  updated: number
  autoComplete: boolean
  maxNeighbours: number
  bus: Bus
  maxFieldItems: number
  initialNodeDisplay: number
  updateStyle: (style: any) => void
  assignVisElement: (v: any) => void
}

export class Visualization extends Component<
  VisualizationProps,
  VisualizationState
> {
  autoCompleteCallback: any
  graph: any

  state: VisualizationState = {
    nodes: [],
    relationships: [],
    updated: 0,
    hasTruncatedFields: false
  }

  componentDidMount() {
    const { records = [] } = this.props.result
    if (records && records.length > 0) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  shouldComponentUpdate(props: any, state: VisualizationState) {
    return (
      this.props.updated !== props.updated ||
      !deepEquals(props.graphStyleData, this.props.graphStyleData) ||
      this.state.updated !== state.updated ||
      this.props.frameHeight !== props.frameHeight ||
      this.props.autoComplete !== props.autoComplete
    )
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.updated !== prevProps.updated ||
      this.props.autoComplete !== prevProps.autoComplete
    ) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  populateDataToStateFromProps(props: any) {
    const {
      nodes,
      relationships
    } = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
      props.result.records,
      true,
      props.maxFieldItems
    )
    const hasTruncatedFields = resultHasTruncatedFields(
      props.result,
      props.maxFieldItems
    )
    this.setState({
      nodes,
      relationships,
      hasTruncatedFields,
      updated: new Date().getTime()
    })
  }

  autoCompleteRelationships(existingNodes: any, newNodes: any) {
    if (this.props.autoComplete) {
      const existingNodeIds = existingNodes.map((node: any) =>
        parseInt(node.id)
      )
      const newNodeIds = newNodes.map((node: any) => parseInt(node.id))

      this.getInternalRelationships(existingNodeIds, newNodeIds)
        .then(graph => {
          this.autoCompleteCallback &&
            this.autoCompleteCallback(graph.relationships)
        })
        .catch(_e => {})
    } else {
      this.autoCompleteCallback && this.autoCompleteCallback([])
    }
  }

  getNeighbours(id: any, currentNeighbourIds = []) {
    const query = `MATCH path = (a)--(o)
                   WHERE id(a) = ${id}
                   AND NOT (id(o) IN[${currentNeighbourIds.join(',')}])
                   RETURN path, size((a)--()) as c
                   ORDER BY id(o)
                   LIMIT ${this.props.maxNeighbours -
                     currentNeighbourIds.length}`
    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              const count =
                response.result.records.length > 0
                  ? parseInt(response.result.records[0].get('c').toString())
                  : 0
              const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                this.props.maxFieldItems
              )
              this.autoCompleteRelationships(
                this.graph._nodes,
                resultGraph.nodes
              )
              resolve({ ...resultGraph, count: count })
            }
          }
        )
    })
  }

  getInternalRelationships(existingNodeIds: any, newNodeIds: any) {
    newNodeIds = newNodeIds.map(neo4j.int)
    existingNodeIds = existingNodeIds.map(neo4j.int)
    existingNodeIds = existingNodeIds.concat(newNodeIds)
    const query =
      'MATCH (a)-[r]->(b) WHERE id(a) IN $existingNodeIds AND id(b) IN $newNodeIds RETURN r;'
    return new Promise<any>((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query,
            params: { existingNodeIds, newNodeIds },
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              resolve({
                ...bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                  response.result.records,
                  false,
                  this.props.maxFieldItems
                )
              })
            }
          }
        )
    })
  }

  setGraph(graph: any) {
    this.graph = graph
    this.autoCompleteRelationships([], this.graph._nodes)
  }

  render() {
    if (!this.state.nodes.length) return null

    return (
      <StyledVisContainer height={this.props.frameHeight}>
        <ExplorerComponent
          maxNeighbours={this.props.maxNeighbours}
          hasTruncatedFields={this.state.hasTruncatedFields}
          initialNodeDisplay={this.props.initialNodeDisplay}
          graphStyleData={this.props.graphStyleData}
          updateStyle={this.props.updateStyle}
          getNeighbours={this.getNeighbours.bind(this)}
          nodes={this.state.nodes}
          relationships={this.state.relationships}
          frameHeight={this.props.frameHeight}
          assignVisElement={this.props.assignVisElement}
          getAutoCompleteCallback={(callback: any) => {
            this.autoCompleteCallback = callback
          }}
          setGraph={this.setGraph.bind(this)}
        />
      </StyledVisContainer>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    graphStyleData: grassActions.getGraphStyleData(state),
    maxFieldItems: getMaxFieldItems(state)
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateStyle: (graphStyleData: any) => {
      dispatch(grassActions.updateGraphStyleData(graphStyleData))
    }
  }
}

export const VisualizationConnectedBus = withBus(
  connect(mapStateToProps, mapDispatchToProps)(Visualization)
)
