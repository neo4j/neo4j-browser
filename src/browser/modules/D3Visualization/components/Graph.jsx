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
import {createGraph, mapNodes, mapRelationships, getGraphStats} from '../mapper'
import {GraphEventHandler} from '../GraphEventHandler'
import '../lib/visualization/index'
import { dim } from 'browser-styles/constants'
import {StyledZoomHolder, StyledSvgWrapper, StyledZoomButton} from './styled'
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'

export class GraphComponent extends Component {

  constructor (props) {
    super(props)
    this.state = {
      zoomInLimitReached: true,
      zoomOutLimitReached: false
    }
  }

  graphInit (el) {
    this.svgElement = el
  }

  zoomInClicked (el) {
    let limits = this.graphView.zoomIn(el)
    this.setState({zoomInLimitReached: limits.zoomInLimit, zoomOutLimitReached: limits.zoomOutLimit})
  }

  zoomOutlicked (el) {
    let limits = this.graphView.zoomOut(el)
    this.setState({zoomInLimitReached: limits.zoomInLimit, zoomOutLimitReached: limits.zoomOutLimit})
  }

  getVisualAreaHeight () {
    if (this.props.frameHeight && this.props.fullscreen) {
      return this.props.frameHeight - (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2)
    } else {
      return this.props.frameHeight - (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2) || this.svgElement.parentNode.offsetHeight
    }
  }

  componentDidMount () {
    if (this.svgElement != null) {
      if (!this.graphView) {
        let NeoConstructor = neo.graphView
        let measureSize = () => {
          return {width: this.svgElement.offsetWidth, height: this.getVisualAreaHeight()}
        }
        this.graph = createGraph(this.props.nodes, this.props.relationships)
        this.graphView = new NeoConstructor(this.svgElement, measureSize, this.graph, this.props.graphStyle)
        new GraphEventHandler(this.graph,
          this.graphView,
          this.props.getNodeNeighbours,
          this.props.onItemMouseOver,
          this.props.onItemSelect,
          this.props.onGraphModelChange
        ).bindEventHandlers()
        this.graphView.resize()
        this.graphView.update()
        this.state.currentStyleRules = this.props.graphStyle.toString()
        this.props.onGraphModelChange(getGraphStats(this.graph))
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if ((nextProps.relationships !== this.props.relationships || nextProps.nodes !== this.props.nodes) && this.graphView !== undefined) {
      this.graph.resetGraph()
      this.graph.addNodes(mapNodes(nextProps.nodes))
      this.graph.addRelationships(mapRelationships(nextProps.relationships, this.graph))
    } else if (this.state.currentStyleRules !== nextProps.graphStyle.toString()) {
      this.graphView.update()
      this.state.currentStyleRules = nextProps.graphStyle.toString()
    }

    if (this.props.fullscreen !== nextProps.fullscreen || this.props.frameHeight !== nextProps.frameHeight) {
      this.setState({shouldResize: true})
    } else {
      this.setState({shouldResize: false})
    }
  }

  componentDidUpdate () {
    if (this.state.shouldResize) {
      this.graphView.resize()
    }
  }

  zoomButtons () {
    if (this.props.fullscreen) {
      return (
        <StyledZoomHolder>
          <StyledZoomButton className={this.state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'} onClick={this.zoomInClicked.bind(this)}>
            <ZoomInIcon />
          </StyledZoomButton>
          <StyledZoomButton className={this.state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'} onClick={this.zoomOutlicked.bind(this)}>
            <ZoomOutIcon />
          </StyledZoomButton>
        </StyledZoomHolder>
      )
    }
    return null
  }

  render () {
    return (
      <StyledSvgWrapper>
        <svg className='neod3viz' ref={this.graphInit.bind(this)} />
        {this.zoomButtons()}
      </StyledSvgWrapper>
    )
  }
}
