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
import React, { useEffect, useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { Action, Dispatch } from 'redux'

import { GraphModel, GraphVisualizer } from 'neo4j-arc/graph-visualization'

import { resultHasTruncatedFields } from 'browser/modules/Stream/CypherFrame/helpers'
import {
  BasicNode,
  BasicNodesAndRels,
  BasicRelationship,
  deepEquals
} from 'neo4j-arc/common'
import bolt from 'services/bolt/bolt'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { GlobalState } from 'shared/globalState'
import { ROUTED_CYPHER_READ_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  getNodePropertiesExpandedByDefault,
  setNodePropertiesExpandedByDefault
} from 'shared/modules/frames/framesDuck'
import * as grassActions from 'shared/modules/grass/grassDuck'
import {
  getMaxFieldItems,
  shouldShowWheelZoomInfo,
  update as updateSettings
} from 'shared/modules/settings/settingsDuck'
import { DetailsPane } from './PropertiesPanelContent/DetailsPane'
import OverviewPane from './PropertiesPanelContent/OverviewPane'
import { StyledVisContainer } from './VisualizationView.styled'

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

const executeCypherQuery = (query: string, params: any = {}, database?: string) => ({
  type: ROUTED_CYPHER_READ_REQUEST,
  query,
  params,
  queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
  useDb: database
})

export const Visualization: React.FC<VisualizationProps> = props => {
  const dispatch = useDispatch()
  const [state, setState] = useState<VisualizationState>({
    nodes: [],
    relationships: [],
    updated: 0,
    nodeLimitHit: false,
    hasTruncatedFields: false
  })

  const autoCompleteCallbackRef = useRef<(
    rels: BasicRelationship[],
    initialRun: boolean
  ) => void>()
  const graphRef = useRef<GraphModel>()

  useEffect(() => {
    const { records = [] } = props.result
    if (records && records.length > 0) {
      populateDataToStateFromProps()
    }
  }, [props.result])

  useEffect(() => {
    if (props.updated !== props.updated || props.autoComplete !== props.autoComplete) {
      populateDataToStateFromProps()
    }
  }, [props.updated, props.autoComplete])

  const populateDataToStateFromProps = () => {
    const { nodes, relationships } =
      bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
        props.result.records,
        true,
        props.maxFieldItems
      )

    const { nodes: uniqNodes, nodeLimitHit } = deduplicateNodes(
      nodes,
      props.initialNodeDisplay
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
    setState({
      nodes: uniqNodes,
      relationships: uniqRels,
      nodeLimitHit,
      hasTruncatedFields,
      updated: new Date().getTime()
    })
  }

  const autoCompleteRelationships = (
    existingNodes: { id: string }[],
    newNodes: { id: string }[],
    initialRun: boolean
  ) => {
    if (props.autoComplete) {
      const existingNodeIds = existingNodes.map(node => parseInt(node.id))
      const newNodeIds = newNodes.map(node => parseInt(node.id))

      getInternalRelationships(existingNodeIds, newNodeIds).then(graph => {
        autoCompleteCallbackRef.current &&
          autoCompleteCallbackRef.current(graph.relationships, initialRun)
      })
    } else {
      autoCompleteCallbackRef.current && autoCompleteCallbackRef.current([], initialRun)
    }
  }

  const getNeighbours = (
    id: string,
    currentNeighbourIds: string[] = []
  ): Promise<BasicNodesAndRels & { allNeighboursCount: number }> => {
    const maxNewNeighbours =
      props.maxNeighbours - currentNeighbourIds.length

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
      dispatch(executeCypherQuery(query, {}, props.result.summary.database.name))
        .then((response: any) => {
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
                props.maxFieldItems
              )
            autoCompleteRelationships(
              graphRef.current?.nodes() || [],
              resultGraph.nodes,
              false
            )
            resolve({ ...resultGraph, allNeighboursCount })
          }
        })
        .catch((error: any) => {
          console.error(error)
          resolve({ 
            nodes: [], 
            relationships: [], 
            allNeighboursCount: 0 
          })
        })
    })
  }

  const getInternalRelationships = (
    rawExistingNodeIds: number[],
    rawNewNodeIds: number[]
  ): Promise<BasicNodesAndRels> => {
    const newNodeIds = rawNewNodeIds.map(n => neo4j.int(n))
    const existingNodeIds = rawExistingNodeIds
      .map(n => neo4j.int(n))
      .concat(newNodeIds)
    const query =
      'MATCH (a)-[r]->(b) WHERE id(a) IN $existingNodeIds AND id(b) IN $newNodeIds RETURN r;'
    return new Promise(resolve => {
      dispatch(executeCypherQuery(query, { existingNodeIds, newNodeIds }, props.result.summary.database.name))
        .then((response: any) => {
          if (!response.success) {
            console.error(response.error)
            resolve({ nodes: [], relationships: [] })
          } else {
            resolve({
              ...bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
                response.result.records,
                false,
                props.maxFieldItems
              )
            })
          }
        })
        .catch((error: any) => {
          console.error(error)
          resolve({ nodes: [], relationships: [] })
        })
    })
  }

  const setGraph = (graph: GraphModel) => {
    graphRef.current = graph
    autoCompleteRelationships([], graphRef.current.nodes(), true)
  }

  return (
    <StyledVisContainer isFullscreen={props.isFullscreen}>
      <GraphVisualizer
        maxNeighbours={props.maxNeighbours}
        hasTruncatedFields={state.hasTruncatedFields}
        graphStyleData={props.graphStyleData}
        updateStyle={props.updateStyle}
        getNeighbours={getNeighbours.bind(this)}
        nodes={state.nodes}
        autocompleteRelationships={props.autoComplete ?? false}
        relationships={state.relationships}
        isFullscreen={props.isFullscreen}
        assignVisElement={props.assignVisElement}
        nodeLimitHit={state.nodeLimitHit}
        getAutoCompleteCallback={(
          callback: (rels: BasicRelationship[], initialRun: boolean) => void
        ) => {
          autoCompleteCallbackRef.current = callback
        }}
        setGraph={setGraph.bind(this)}
        setNodePropertiesExpandedByDefault={
          props.setNodePropertiesExpandedByDefault
        }
        nodePropertiesExpandedByDefault={
          props.nodePropertiesExpandedByDefault
        }
        wheelZoomRequiresModKey={!props.isFullscreen}
        wheelZoomInfoMessageEnabled={
          props.wheelZoomInfoMessageEnabled && !props.isFullscreen
        }
        disableWheelZoomInfoMessage={props.disableWheelZoomInfoMessage}
        DetailsPaneOverride={DetailsPane}
        OverviewPaneOverride={OverviewPane}
        useGeneratedDefaultColors={false}
        initialZoomToFit
      />
    </StyledVisContainer>
  )
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

export const VisualizationConnectedBus = connect(mapStateToProps, mapDispatchToProps)(Visualization)

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
