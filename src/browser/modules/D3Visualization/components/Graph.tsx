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
import React, { Component } from 'react'

import { GetNodeNeighboursFn, GraphEventHandler } from '../GraphEventHandler'
import GraphStyle from '../graphStyle'
import Graph from '../lib/visualization/components/Graph'
import GraphView from '../lib/visualization/components/GraphView'
import {
  GraphStats,
  createGraph,
  getGraphStats,
  mapRelationships
} from '../mapper'
import GraphLayoutModal from './modal/GraphLayoutModal'
import { StyledSvgWrapper, StyledZoomButton, StyledZoomHolder } from './styled'
import { VizItem } from './types'
import {
  GraphLayoutIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'browser-components/icons/Icons'
import { BasicNode, BasicRelationship } from 'services/bolt/boltMappings'

export const PERSIST_LAYOUT_KEY = 'persistLayout'
export const PERSIST_LAYOUT_DIRECTION = 'directional'
interface IGraphStat {
  count: number
  properties: { [key: string]: string } | string[]
}
export interface IGraphLayoutStats {
  labels: {
    '*': IGraphStat
    [key: string]: IGraphStat
  }
  relTypes: {
    '*': IGraphStat
    [key: string]: IGraphStat
  }
}
type GraphState = {
  zoomInLimitReached: boolean
  zoomOutLimitReached: boolean
  graphLayoutModalOpen: boolean
  graphLayoutStats: IGraphLayoutStats
}

type GraphProps = {
  isFullscreen: boolean
  relationships: BasicRelationship[]
  nodes: BasicNode[]
  getNodeNeighbours: GetNodeNeighboursFn
  onItemMouseOver: (item: VizItem) => void
  onItemSelect: (item: VizItem) => void
  graphStyle: GraphStyle
  styleVersion: any
  onGraphModelChange: (stats: GraphStats) => void
  assignVisElement: any
  getAutoCompleteCallback: any
  setGraph: any
  offset: any
  filterNodeNeighbours: GraphEventHandler['filterNodeNeighbours']
}

export class GraphComponent extends Component<GraphProps, GraphState> {
  graph: Graph | undefined
  graphEventHandler: GraphEventHandler | undefined
  graphView: GraphView | undefined
  svgElement: any
  isLayoutApplied = false
  lastGraphRelLength = 0
  state: GraphState = {
    zoomInLimitReached: false,
    zoomOutLimitReached: false,
    graphLayoutModalOpen: false,
    graphLayoutStats: {
      labels: { '*': { count: 0, properties: [] } },
      relTypes: { '*': { count: 0, properties: [] } }
    }
  }

  graphInit(el: any): void {
    this.svgElement = el
  }
  graphLayoutClicked = () => {
    // const stats = getGraphStats(this.graph!);
    this.setState({
      graphLayoutModalOpen: true,
      graphLayoutStats: {
        labels: { '*': { count: 0, properties: [] } },
        relTypes: { '*': { count: 0, properties: [] } }
      }
    })
  }
  closeGraphLayoutModal = () => this.setState({ graphLayoutModalOpen: false })

  zoomInClicked(el: any): void {
    if (this.graphView) {
      const limits = this.graphView.zoomIn(el)
      this.setState({
        zoomInLimitReached: limits.zoomInLimit,
        zoomOutLimitReached: limits.zoomOutLimit
      })
    }
  }

  zoomOutClicked(el: any): void {
    if (this.graphView) {
      const limits = this.graphView.zoomOut(el)
      this.setState({
        zoomInLimitReached: limits.zoomInLimit,
        zoomOutLimitReached: limits.zoomOutLimit
      })
    }
  }

  componentDidMount(): void {
    if (this.svgElement != null) {
      // this.initGraphView and this.addInternalRelationships both call this.graph.update()
      // so, the same graph will be calculated twice
      // for now, we added conditions to control which parts to be drawn to avoid repeated rendering
      // the function need to be refactored in a better way in the future
      this.initGraphView()
      this.graph && this.props.setGraph && this.props.setGraph(this.graph)
      this.props.getAutoCompleteCallback &&
        this.props.getAutoCompleteCallback(this.addInternalRelationships)
      this.props.assignVisElement &&
        this.props.assignVisElement(this.svgElement, this.graphView)
    }
  }

  initGraphView(): void {
    if (!this.graphView) {
      const NeoConstructor = GraphView
      const measureSize = () => ({
        width: this.svgElement.offsetWidth,
        height: this.svgElement?.parentElement.clientHeight
      })
      this.graph = createGraph(this.props.nodes, this.props.relationships)
      this.graphView = new NeoConstructor(
        this.svgElement,
        measureSize,
        this.graph,
        this.props.graphStyle
      )
      this.graphEventHandler = new GraphEventHandler(
        this.graph,
        this.graphView,
        this.props.getNodeNeighbours,
        this.props.onItemMouseOver,
        this.props.onItemSelect,
        this.props.onGraphModelChange,
        this.props.filterNodeNeighbours
      )
      this.graphEventHandler.bindEventHandlers()
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.resize()
      this.graphView.update({ updateNodes: true, updateRelationships: false })
    }
  }
  onDirectionalLayoutClick = (persist: boolean) => {
    if (this.graphView) {
      this.graphView.graph.layoutRootNodeOnTop()
      this.graphView.update({ updateNodes: true, updateRelationships: true })
    }
    if (persist) {
      localStorage.setItem(PERSIST_LAYOUT_KEY, PERSIST_LAYOUT_DIRECTION)
    }
  }
  onDefaultLayoutClick = (persist: boolean) => {
    if (this.graphView) {
      this.graphView.graph.layoutDefault()
      this.graphView.update({ updateNodes: true, updateRelationships: true })
    }
    if (persist) {
      localStorage.removeItem(PERSIST_LAYOUT_KEY)
    }
  }
  addInternalRelationships = (
    internalRelationships: BasicRelationship[]
  ): void => {
    if (this.graph) {
      this.graph.addInternalRelationships(
        mapRelationships(internalRelationships, this.graph)
      )
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView?.update({ updateNodes: false, updateRelationships: true })
      this.graphEventHandler?.onItemMouseOut()
    }
  }

  componentDidUpdate(prevProps: GraphProps): void {
    if (prevProps.styleVersion !== this.props.styleVersion) {
      this.graphView?.update({ updateNodes: true, updateRelationships: true })
    }
    if (this.props.isFullscreen !== prevProps.isFullscreen) {
      this.graphView?.resize()
      this.graphView?.update({ updateNodes: true, updateRelationships: true })
    }
    if (
      this.graph &&
      (!this.isLayoutApplied ||
        this.lastGraphRelLength !== this.graph.relationships().length)
    ) {
      this.isLayoutApplied = true
      this.lastGraphRelLength = this.graph.relationships().length
      if (
        localStorage.getItem(PERSIST_LAYOUT_KEY) === PERSIST_LAYOUT_DIRECTION
      ) {
        this.onDirectionalLayoutClick(false)
      }
    }
  }

  zoomButtons = (): JSX.Element => (
    <StyledZoomHolder
      offset={this.props.offset}
      isFullscreen={this.props.isFullscreen}
    >
      <StyledZoomButton onClick={this.graphLayoutClicked}>
        <GraphLayoutIcon regulateSize={this.props.isFullscreen ? 2 : 1} />
      </StyledZoomButton>
      <StyledZoomButton
        className={this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'}
        onClick={this.zoomInClicked.bind(this)}
      >
        <ZoomInIcon regulateSize={this.props.isFullscreen ? 2 : 1} />
      </StyledZoomButton>
      <StyledZoomButton
        className={
          this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'
        }
        onClick={this.zoomOutClicked.bind(this)}
      >
        <ZoomOutIcon regulateSize={this.props.isFullscreen ? 2 : 1} />
      </StyledZoomButton>
    </StyledZoomHolder>
  )

  render = (): JSX.Element => (
    <StyledSvgWrapper>
      <svg className="neod3viz" ref={this.graphInit.bind(this)} />
      {this.zoomButtons()}
      <GraphLayoutModal
        isOpen={this.state.graphLayoutModalOpen}
        onClose={this.closeGraphLayoutModal}
        stats={this.state.graphLayoutStats}
        onDirectionalLayoutClick={this.onDirectionalLayoutClick}
        onDefaultLayoutClick={this.onDefaultLayoutClick}
      />
    </StyledSvgWrapper>
  )
}
