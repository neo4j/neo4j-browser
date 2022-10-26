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
import { withBus } from 'react-suber'
import { Action, Dispatch } from 'redux'
import { Bus } from 'suber'

import { GraphModel, GraphVisualizer } from 'neo4j-arc/graph-visualization'

import { StyledVisContainer } from './VisualizationView.styled'
import { resultHasTruncatedFields } from 'browser/modules/Stream/CypherFrame/helpers'
import bolt from 'services/bolt/bolt'
import {
  BasicNode,
  BasicNodesAndRels,
  BasicRelationship
} from 'neo4j-arc/common'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { deepEquals } from 'neo4j-arc/common'
import { GlobalState } from 'shared/globalState'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import * as grassActions from 'shared/modules/grass/grassDuck'
import {
  getMaxFieldItems,
  shouldShowWheelZoomInfo,
  update as updateSettings
} from 'shared/modules/settings/settingsDuck'
import {
  getNodePropertiesExpandedByDefault,
  setNodePropertiesExpandedByDefault
} from 'shared/modules/frames/framesDuck'
import { DetailsPane } from './PropertiesPanelContent/DetailsPane'
import OverviewPane from './PropertiesPanelContent/OverviewPane'

type VisualizationState = {
  updated: number
  nodes: BasicNode[]
  relationships: BasicRelationship[]
  hasTruncatedFields: boolean
  nodeLimitHit: boolean
}

export type VisualizationProps = {
  result: any
  graphStyleData: any
  updated: number
  autoComplete: boolean
  maxNeighbours: number
  bus: Bus
  maxFieldItems: number
  initialNodeDisplay: number
  isFullscreen: boolean
  updateStyle: (style: any) => void
  assignVisElement: (v: any) => void
  nodePropertiesExpandedByDefault: boolean
  setNodePropertiesExpandedByDefault: (expandedByDefault: boolean) => void
  wheelZoomInfoMessageEnabled: boolean
  disableWheelZoomInfoMessage: () => void
}

export class Visualization extends Component<
  VisualizationProps,
  VisualizationState
> {
  autoCompleteCallback: ((rels: BasicRelationship[]) => void) | undefined
  graph: GraphModel | undefined
  state: VisualizationState = {
    nodes: [],
    relationships: [],
    updated: 0,
    nodeLimitHit: false,
    hasTruncatedFields: false
  }

  componentDidMount(): void {
    const { records = [] } = this.props.result
    if (records && records.length > 0) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  shouldComponentUpdate(
    props: VisualizationProps,
    state: VisualizationState
  ): boolean {
    return (
      this.props.updated !== props.updated ||
      this.props.isFullscreen !== props.isFullscreen ||
      !deepEquals(props.graphStyleData, this.props.graphStyleData) ||
      this.state.updated !== state.updated ||
      this.props.autoComplete !== props.autoComplete ||
      this.props.wheelZoomInfoMessageEnabled !==
        props.wheelZoomInfoMessageEnabled
    )
  }

  componentDidUpdate(prevProps: VisualizationProps): void {
    if (
      this.props.updated !== prevProps.updated ||
      this.props.autoComplete !== prevProps.autoComplete
    ) {
      this.populateDataToStateFromProps(this.props)
    }
  }

  populateDataToStateFromProps(props: VisualizationProps): void {
    const { nodes, relationships } =
      bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
        props.result.records,
        true,
        props.maxFieldItems
      )

    const { nodes: uniqNodes, nodeLimitHit } = deduplicateNodes(
      nodes,
      this.props.initialNodeDisplay
    )

    const uniqRels = nodeLimitHit
      ? relationships.filter(
          rel =>
            !!uniqNodes.find(node => node.id === rel.startNodeId) &&
            !!uniqNodes.find(node => node.id === rel.endNodeId)
        )
      : relationships

    const hasTruncatedFields = resultHasTruncatedFields(
      props.result,
      props.maxFieldItems
    )
    this.setState({
      nodes: uniqNodes,
      relationships: uniqRels,
      nodeLimitHit,
      hasTruncatedFields,
      updated: new Date().getTime()
    })
  }

  autoCompleteRelationships(
    existingNodes: { id: string }[],
    newNodes: { id: string }[]
  ): void {
    if (this.props.autoComplete) {
      const existingNodeIds = existingNodes.map(node => parseInt(node.id))
      const newNodeIds = newNodes.map(node => parseInt(node.id))

      this.getInternalRelationships(existingNodeIds, newNodeIds).then(graph => {
        this.autoCompleteCallback &&
          this.autoCompleteCallback(graph.relationships)
      })
    } else {
      this.autoCompleteCallback && this.autoCompleteCallback([])
    }
  }

  getNeighbours(
    id: string,
    currentNeighbourIds: string[] = []
  ): Promise<BasicNodesAndRels & { allNeighboursCount: number }> {
    const maxNewNeighbours =
      this.props.maxNeighbours - currentNeighbourIds.length

    const query =
      maxNewNeighbours > 0
        ? `MATCH (a) WHERE id(a) = ${id}
WITH a, size([(a)--() | 1]) AS allNeighboursCount
MATCH path = (a)--(o) WHERE NOT id(o) IN [${currentNeighbourIds.join(',')}]
RETURN path, allNeighboursCount
ORDER BY id(o)
LIMIT ${maxNewNeighbours}`
        : `MATCH p=(a)--() WHERE id(a) = ${id} RETURN count(p) as allNeighboursCount`

    return new Promise((resolve, reject) => {
      this.props.bus &&
        this.props.bus.self(
          CYPHER_REQUEST,
          { query: query, queryType: NEO4J_BROWSER_USER_ACTION_QUERY },
          (response: any) => {
            if (!response.success) {
              reject(new Error())
            } else {
              const allNeighboursCount =
                response.result.records.length > 0
                  ? parseInt(
                      response.result.records[0]
                        .get('allNeighboursCount')
                        .toString()
                    )
                  : 0
              const resultGraph =
                bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                  response.result.records,
                  false,
                  this.props.maxFieldItems
                )
              this.autoCompleteRelationships(
                this.graph?.nodes() || [],
                resultGraph.nodes
              )
              resolve({ ...resultGraph, allNeighboursCount })
            }
          }
        )
    })
  }

  getInternalRelationships(
    rawExistingNodeIds: number[],
    rawNewNodeIds: number[]
  ): Promise<BasicNodesAndRels> {
    const newNodeIds = rawNewNodeIds.map(neo4j.int)
    const existingNodeIds = rawExistingNodeIds.map(neo4j.int).concat(newNodeIds)
    const query =
      'MATCH (a)-[r]->(b) WHERE id(a) IN $existingNodeIds AND id(b) IN $newNodeIds RETURN r;'
    return new Promise(resolve => {
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
              console.error(response.error)
              resolve({ nodes: [], relationships: [] })
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

  setGraph(graph: GraphModel): void {
    this.graph = graph
    this.autoCompleteRelationships([], this.graph.nodes())
  }

  render(): React.ReactNode {
    if (!this.state.nodes.length) return null

    return (
      <StyledVisContainer isFullscreen={this.props.isFullscreen}>
        <GraphVisualizer
          maxNeighbours={this.props.maxNeighbours}
          hasTruncatedFields={this.state.hasTruncatedFields}
          graphStyleData={this.props.graphStyleData}
          updateStyle={this.props.updateStyle}
          getNeighbours={this.getNeighbours.bind(this)}
          nodes={this.state.nodes}
          autocompleteRelationships={this.props.autoComplete ?? false}
          relationships={this.state.relationships}
          isFullscreen={this.props.isFullscreen}
          assignVisElement={this.props.assignVisElement}
          nodeLimitHit={this.state.nodeLimitHit}
          getAutoCompleteCallback={(
            callback: (rels: BasicRelationship[]) => void
          ) => {
            this.autoCompleteCallback = callback
          }}
          setGraph={this.setGraph.bind(this)}
          setNodePropertiesExpandedByDefault={
            this.props.setNodePropertiesExpandedByDefault
          }
          nodePropertiesExpandedByDefault={
            this.props.nodePropertiesExpandedByDefault
          }
          wheelZoomRequiresModKey={!this.props.isFullscreen}
          wheelZoomInfoMessageEnabled={
            this.props.wheelZoomInfoMessageEnabled && !this.props.isFullscreen
          }
          disableWheelZoomInfoMessage={this.props.disableWheelZoomInfoMessage}
          DetailsPaneOverride={DetailsPane}
          OverviewPaneOverride={OverviewPane}
          useGeneratedDefaultColors={false}
          initialZoomToFit
        />
      </StyledVisContainer>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  graphStyleData: grassActions.getGraphStyleData(state),
  maxFieldItems: getMaxFieldItems(state),
  nodePropertiesExpandedByDefault: getNodePropertiesExpandedByDefault(state),
  wheelZoomInfoMessageEnabled: shouldShowWheelZoomInfo(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  disableWheelZoomInfoMessage: () => {
    dispatch(updateSettings({ showWheelZoomInfo: false }))
  },
  setNodePropertiesExpandedByDefault: (expandedByDefault: boolean) =>
    dispatch(setNodePropertiesExpandedByDefault(expandedByDefault)),
  updateStyle: (graphStyleData: any) => {
    dispatch(grassActions.updateGraphStyleData(graphStyleData))
  }
})

export const VisualizationConnectedBus = withBus(
  connect(mapStateToProps, mapDispatchToProps)(Visualization)
)

type DeduplicateHelper = {
  nodes: BasicNode[]
  taken: Record<string, boolean>
  nodeLimitHit: boolean
}

const deduplicateNodes = (
  nodes: BasicNode[],
  limit: number
): { nodes: BasicNode[]; nodeLimitHit: boolean } =>
  nodes.reduce(
    (all: DeduplicateHelper, curr: BasicNode) => {
      if (all.nodes.length === limit) {
        all.nodeLimitHit = true
      } else if (!all.taken[curr.id]) {
        all.nodes.push(curr)
        all.taken[curr.id] = true
      }
      return all
    },
    { nodes: [], taken: {}, nodeLimitHit: false }
  )
