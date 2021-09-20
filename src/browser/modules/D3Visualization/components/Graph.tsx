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
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import graphView from '../lib/visualization/components/graphView'

type State = any

export class GraphComponent extends Component<any, State> {
  graph: any
  graphEH: any
  graphView: any
  svgElement: any

  graphInit(el: any) {
    this.svgElement = el
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
        this.props.onGraphModelChange
      )
      this.graphEH.bindEventHandlers()
      this.props.onGraphModelChange(getGraphStats(this.graph))
      this.graphView.resize()
      this.graphView.update()
    }
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

  render() {
    return (
      <StyledSvgWrapper>
        <svg className="neod3viz" ref={this.graphInit.bind(this)} />
        {this.graphView && (
          <ZoomButtons
            fullscreen={this.props.fullscreen}
            zoomIn={this.graphView.zoomIn.bind(this)}
            zoomOut={this.graphView.zoomOut.bind(this)}
            // TODO ZOOM CRASHES
          />
        )}
      </StyledSvgWrapper>
    )
  }
}

type ZoomLimits = { zoomInLimit: boolean; zoomOutLimit: boolean }
type ZoomButtonProps = {
  fullscreen: boolean
  zoomIn: () => ZoomLimits
  zoomOut: () => ZoomLimits
}

type ZoomButtonState = {
  zoomInLimitReached: boolean
  zoomOutLimitReached: boolean
}
class ZoomButtons extends React.Component<ZoomButtonProps, ZoomButtonState> {
  state: ZoomButtonState = {
    zoomInLimitReached: false,
    zoomOutLimitReached: false
  }

  zoomInClicked = () => {
    const limits = this.props.zoomIn()
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  zoomOutClicked = () => {
    const limits = this.props.zoomOut()
    this.setState({
      zoomInLimitReached: limits.zoomInLimit,
      zoomOutLimitReached: limits.zoomOutLimit
    })
  }

  render() {
    return (
      <StyledZoomHolder fullscreen={this.props.fullscreen}>
        <StyledZoomButton
          className={
            this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'
          }
          onClick={this.zoomInClicked}
        >
          <ZoomInIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
        <StyledZoomButton
          className={
            this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'
          }
          onClick={this.zoomOutClicked}
        >
          <ZoomOutIcon regulateSize={this.props.fullscreen ? 2 : 1} />
        </StyledZoomButton>
      </StyledZoomHolder>
    )
  }
}
