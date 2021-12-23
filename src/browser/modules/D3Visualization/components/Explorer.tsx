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
import deepmerge from 'deepmerge'
import { debounce } from 'lodash'
import React, { Component } from 'react'
import { ConnectedComponent, connect } from 'react-redux'
import { Action, Dispatch } from 'redux'

import { GetNodeNeighboursFn } from '../GraphEventHandler'
import { GraphStyle } from '../graphStyle'
import Graph from '../lib/visualization/components/Graph'
import { GraphStats } from '../mapper'
import { GraphComponent } from './Graph'
import { NodeInspectorPanel, defaultPanelWidth } from './NodeInspectorPanel'
import { StyledFullSizeContainer, panelMinWidth } from './styled'
import { VizItem } from './types'
import {
  BasicNode,
  BasicNodesAndRels,
  BasicRelationship
} from 'services/bolt/boltMappings'
import { deepEquals } from 'services/utils'
import { GlobalState } from 'shared/globalState'
import {
  getNodePropertiesExpandedByDefault,
  setNodePropertiesExpandedByDefault
} from 'shared/modules/frames/framesDuck'

type DecuplicateHelper = { nodes: BasicNode[]; taken: Record<string, boolean> }
const deduplicateNodes = (nodes: BasicNode[]): BasicNode[] =>
  nodes.reduce(
    (all: DecuplicateHelper, curr: BasicNode) => {
      if (all.taken[curr.id]) {
        return all
      } else {
        all.nodes.push(curr)
        all.taken[curr.id] = true
        return all
      }
    },
    { nodes: [], taken: {} }
  ).nodes

type ExplorerComponentProps = {
  relationships: BasicRelationship[]
  nodes: BasicNode[]
  initialNodeDisplay: any
  maxNeighbours: number
  graphStyleData: any
  getNeighbours: (
    id: string,
    currentNeighbourIds: string[] | undefined
  ) => Promise<BasicNodesAndRels & { count: number }>
  updateStyle: any
  isFullscreen: boolean
  assignVisElement: (v: any) => void
  getAutoCompleteCallback: (
    callback: (rels: BasicRelationship[]) => void
  ) => void
  setGraph: (graph: Graph) => void
  hasTruncatedFields: boolean
}
type ExporerReduxProps = {
  nodePropertiesExpandedByDefault: boolean
  setNodePropertiesExpandedByDefault: (expandedByDefault: boolean) => void
}

type ExplorerComponentState = {
  graphStyle: GraphStyle
  hoveredItem: VizItem
  nodes: BasicNode[]
  relationships: BasicRelationship[]
  selectedItem: VizItem
  stats: GraphStats
  styleVersion: number
  freezeLegend: boolean
  width: number
  nodePropertiesExpanded: boolean
}
type FullExplorerProps = ExplorerComponentProps & ExporerReduxProps

export class ExplorerComponent extends Component<
  FullExplorerProps,
  ExplorerComponentState
> {
  defaultStyle: any

  constructor(props: FullExplorerProps) {
    super(props)
    const graphStyle = new GraphStyle()
    this.defaultStyle = graphStyle.toSheet()
    let relationships = this.props.relationships
    let nodes = deduplicateNodes(this.props.nodes)
    let selectedItem: VizItem = {
      type: 'canvas',
      item: {
        nodeCount: Math.min(this.props.initialNodeDisplay, nodes.length),
        relationshipCount: relationships.length
      }
    }
    if (nodes.length > parseInt(this.props.initialNodeDisplay)) {
      nodes = nodes.slice(0, this.props.initialNodeDisplay)
      relationships = this.props.relationships.filter(item => {
        return !!nodes.find(node => node.id === item.startNodeId)
      })
      selectedItem = {
        type: 'status-item',
        item: `Not all return nodes are being displayed due to Initial Node Display setting. Only ${this.props.initialNodeDisplay} of ${nodes.length} nodes are being displayed`
      }
    }
    if (this.props.graphStyleData) {
      const rebasedStyle = deepmerge(
        this.defaultStyle,
        this.props.graphStyleData
      )
      graphStyle.loadRules(rebasedStyle)
    }
    this.state = {
      stats: {
        labels: {},
        relTypes: {}
      },
      graphStyle,
      styleVersion: 0,
      nodes,
      relationships,
      selectedItem,
      hoveredItem: selectedItem,
      freezeLegend: false,
      width: defaultPanelWidth(),
      nodePropertiesExpanded: this.props.nodePropertiesExpandedByDefault
    }
  }

  getNodeNeighbours: GetNodeNeighboursFn = (
    node,
    currentNeighbourIds,
    callback
  ) => {
    if (currentNeighbourIds.length > this.props.maxNeighbours) {
      callback({ nodes: [], relationships: [] })
    }
    this.props.getNeighbours(node.id, currentNeighbourIds).then(
      ({ nodes, relationships, count }) => {
        if (count > this.props.maxNeighbours - currentNeighbourIds.length) {
          this.setState({
            selectedItem: {
              type: 'status-item',
              item: `Rendering was limited to ${
                this.props.maxNeighbours
              } of the node's total ${
                count + currentNeighbourIds.length
              } neighbours due to browser config maxNeighbours.`
            }
          })
        }
        callback({ nodes, relationships })
      },
      () => {
        callback({ nodes: [], relationships: [] })
      }
    )
  }

  onItemMouseOver(item: VizItem): void {
    this.setHoveredItem(item)
  }

  mounted = true
  setHoveredItem = debounce((hoveredItem: VizItem) => {
    if (this.mounted) {
      this.setState({ hoveredItem })
    }
  }, 200)

  onItemSelect(selectedItem: VizItem): void {
    this.setState({ selectedItem })
  }

  onGraphModelChange(stats: GraphStats): void {
    this.setState({ stats })
    this.props.updateStyle(this.state.graphStyle.toSheet())
  }

  componentDidUpdate(prevProps: ExplorerComponentProps): void {
    if (!deepEquals(prevProps.graphStyleData, this.props.graphStyleData)) {
      if (this.props.graphStyleData) {
        const rebasedStyle = deepmerge(
          this.defaultStyle,
          this.props.graphStyleData
        )
        this.state.graphStyle.loadRules(rebasedStyle)
        this.setState({
          graphStyle: this.state.graphStyle,
          styleVersion: this.state.styleVersion + 1
        })
      } else {
        this.state.graphStyle.resetToDefault()
        this.setState(
          { graphStyle: this.state.graphStyle, freezeLegend: true },
          () => {
            this.setState({ freezeLegend: false })
            this.props.updateStyle(this.state.graphStyle.toSheet())
          }
        )
      }
    }
  }

  render(): JSX.Element {
    // This is a workaround to make the style reset to the same colors as when starting the browser with an empty style
    // If the legend component has the style it will ask the neoGraphStyle object for styling before the graph component,
    // and also doing this in a different order from the graph. This leads to different default colors being assigned to different labels.
    const graphStyle = this.state.freezeLegend
      ? new GraphStyle()
      : this.state.graphStyle

    return (
      <StyledFullSizeContainer id="svg-vis">
        <GraphComponent
          isFullscreen={this.props.isFullscreen}
          relationships={this.state.relationships}
          nodes={this.state.nodes}
          getNodeNeighbours={this.getNodeNeighbours.bind(this)}
          onItemMouseOver={this.onItemMouseOver.bind(this)}
          onItemSelect={this.onItemSelect.bind(this)}
          graphStyle={graphStyle}
          styleVersion={this.state.styleVersion} // cheap way for child to check style updates
          onGraphModelChange={this.onGraphModelChange.bind(this)}
          assignVisElement={this.props.assignVisElement}
          getAutoCompleteCallback={this.props.getAutoCompleteCallback}
          setGraph={this.props.setGraph}
          offset={
            (this.state.nodePropertiesExpanded ? this.state.width : 0) + 4
          }
        />
        <NodeInspectorPanel
          graphStyle={graphStyle}
          hasTruncatedFields={this.props.hasTruncatedFields}
          hoveredItem={this.state.hoveredItem}
          selectedItem={this.state.selectedItem}
          stats={this.state.stats}
          width={this.state.width}
          setWidth={(width: number) =>
            this.setState({ width: Math.max(panelMinWidth, width) })
          }
          expanded={this.state.nodePropertiesExpanded}
          toggleExpanded={() => {
            const { nodePropertiesExpanded } = this.state
            this.props.setNodePropertiesExpandedByDefault(
              !nodePropertiesExpanded
            )
            this.setState({ nodePropertiesExpanded: !nodePropertiesExpanded })
          }}
        />
      </StyledFullSizeContainer>
    )
  }

  componentWillUnmount(): void {
    this.mounted = false
  }
}

export const Explorer: ConnectedComponent<
  typeof ExplorerComponent,
  ExplorerComponentProps
> = connect(
  (state: GlobalState) => ({
    nodePropertiesExpandedByDefault: getNodePropertiesExpandedByDefault(state)
  }),
  (dispatch: Dispatch<Action>) => ({
    setNodePropertiesExpandedByDefault: (expandedByDefault: boolean) =>
      dispatch(setNodePropertiesExpandedByDefault(expandedByDefault))
  })
)(ExplorerComponent)

export default Explorer
