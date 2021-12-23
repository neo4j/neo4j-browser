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
import { StyledZoomHolder, StyledSvgWrapper, StyledZoomButton } from './styled'
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'
import { Node } from 'browser/modules/Stream/CypherFrame/VisualizationView'
import GraphStyle from '../graphStyle'

type State = any

type GraphProps = {
  isFullscreen: boolean
  relationships: any
  nodes: Node[]
  getNodeNeighbours: any
  onItemMouseOver: any
  onItemSelect: any
  graphStyle: GraphStyle
  styleVersion: any
  onGraphModelChange: any
  assignVisElement: any
  getAutoCompleteCallback: any
  setGraph: any
  offset: any
}

export class GraphComponent extends Component<GraphProps, State> {
  graph: any
  graphEH: any
  graphView: any
  svgElement: any
  state = {
    zoomInLimitReached: false,
    zoomOutLimitReached: false
  }

  graphInit(el: any) {
    this.svgElement = el
  }

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

  componentDidMount() {
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

  initGraphView() {
    if (!this.graphView) {
      const NeoConstructor = graphView
      const measureSize = () => {
        return {
          width: this.svgElement.offsetWidth,
          height: this.svgElement?.parentElement.clientHeight
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
        this.props.onGraphModelChange
      )
      this.graphEH.bindEventHandlers()
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.resize()
      this.graphView.update({ updateNodes: true, updateRelationships: false })
    }
  }

  addInternalRelationships = (internalRelationships: any) => {
    if (this.graph) {
      this.graph.addInternalRelationships(
        mapRelationships(internalRelationships, this.graph)
      )
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.update({ updateNodes: false, updateRelationships: true })
      this.graphEH.onItemMouseOut()
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.styleVersion !== this.props.styleVersion) {
      this.graphView.update({ updateNodes: true, updateRelationships: true })
    }
    if (this.props.isFullscreen !== prevProps.isFullscreen) {
      this.graphView.resize()
      this.graphView.update()
    }
  }

  zoomButtons() {
    return (
      <StyledZoomHolder
        offset={this.props.offset}
        isFullscreen={this.props.isFullscreen}
      >
        <StyledZoomButton
          className={
            this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'
          }
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
  }

  render() {
    return (
      <StyledSvgWrapper>
        <svg className="neod3viz" ref={this.graphInit.bind(this)} />
        {this.zoomButtons()}
      </StyledSvgWrapper>
    )
  }
}
