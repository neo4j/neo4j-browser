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
import { createGraph, mapRelationships, getGraphStats } from '../mapper'
import { GraphEventHandler } from '../GraphEventHandler'
import '../lib/visualization/index'
import { dim } from 'browser-styles/constants'
import { StyledZoomHolder, StyledSvgWrapper, StyledZoomButton } from './styled'
import {
  GraphLayoutIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'
import GraphLayoutModal from './modal/GraphLayoutModal'
import Graph from 'project-root/src/browser/modules/D3Visualization/lib/visualization/components/graph'
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
interface IState {
  zoomInLimitReached: boolean
  zoomOutLimitReached: boolean
  graphLayoutModalOpen: boolean
  graphLayoutStats: IGraphLayoutStats
}
interface IGraphStat {
  count: number
  properties: { [key: string]: string } | string[]
}
export class GraphComponent extends Component<any, IState> {
  graph!: Graph
  graphEH: any
  graphView!: graphView
  svgElement: any
  state = {
    zoomInLimitReached: false,
    zoomOutLimitReached: false,
    graphLayoutModalOpen: false,
    graphLayoutStats: {
      labels: { '*': { count: 0, properties: [] } },
      relTypes: { '*': { count: 0, properties: [] } }
    }
  }

  graphInit(el: any) {
    this.svgElement = el
  }

  graphLayoutClicked = () => {
    this.setState({
      graphLayoutModalOpen: true,
      graphLayoutStats: getGraphStats(this.graph)
    })
  }
  closeGraphLayoutModal = () => this.setState({ graphLayoutModalOpen: false })
  zoomInClicked(el: any) {
    const limits = this.graphView.zoomIn(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  zoomOutClicked(el: any) {
    const limits = this.graphView.zoomOut(el)
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  getVisualAreaHeight() {
    return this.props.frameHeight && this.props.fullscreen
      ? this.props.frameHeight -
          (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2)
      : this.props.frameHeight - dim.frameStatusbarHeight ||
          this.svgElement.parentNode.offsetHeight
  }

  componentDidMount() {
    if (this.svgElement != null) {
      this.initGraphView()
      this.graph && this.props.setGraph && this.props.setGraph(this.graph)
      this.props.getAutoCompleteCallback &&
        this.props.getAutoCompleteCallback(this.addInternalRelationships)
      this.props.assignVisElement &&
        this.props.assignVisElement(this.svgElement, this.graphView)
    }
  }

  initGraphView() {
    if (!this.graphView) {
      const NeoConstructor = graphView
      const measureSize = () => {
        return {
          width: this.svgElement.offsetWidth,
          height: this.getVisualAreaHeight()
        }
      }
      this.graph = createGraph(this.props.nodes, this.props.relationships)
      this.graphView = new NeoConstructor(
        this.svgElement,
        measureSize,
        this.graph,
        this.props.graphStyle
      )
      this.graphEH = new GraphEventHandler(
        this.graph,
        this.graphView,
        this.props.getNodeNeighbours,
        this.props.onItemMouseOver,
        this.props.onItemSelect,
        this.props.onGraphModelChange,
        this.props.filterNodeNeighbours
      )
      this.graphEH.bindEventHandlers()
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.resize()
      this.graphView.update()
    }
  }
  onDirectionalLayoutClick = () => {
    this.graphView.graph.layoutRootNodeOnTop()
    this.graphView.update()
  }
  onDefaultLayoutClick = () => {
    this.graphView.graph.layoutDefault()
    this.graphView.update()
  }
  addInternalRelationships = (internalRelationships: any) => {
    if (this.graph) {
      this.graph.addInternalRelationships(
        mapRelationships(internalRelationships, this.graph)
      )
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.update()
      this.graphEH.onItemMouseOut()
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.styleVersion !== this.props.styleVersion) {
      this.graphView.update()
    }
    if (
      this.props.fullscreen !== prevProps.fullscreen ||
      this.props.frameHeight !== prevProps.frameHeight
    ) {
      this.graphView.resize()
    }
  }

  zoomButtons() {
    return (
      <StyledZoomHolder fullscreen={this.props.fullscreen}>
        <StyledZoomButton onClick={this.graphLayoutClicked}>
          <GraphLayoutIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
        <StyledZoomButton
          className={
            this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'
          }
          onClick={this.zoomInClicked.bind(this)}
        >
          <ZoomInIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
        <StyledZoomButton
          className={
            this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'
          }
          onClick={this.zoomOutClicked.bind(this)}
        >
          <ZoomOutIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
      </StyledZoomHolder>
    )
  }

  render() {
    // @ts-ignore
    window.test1 = { s: this.state, p: this.props, t: this }
    return (
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
}
