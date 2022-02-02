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
import React from 'react'
import { connect } from 'react-redux'
import { Action, Dispatch } from 'redux'

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
import { WheelZoomInfoOverlay } from './WheelZoomInfoOverlay'
import { StyledSvgWrapper, StyledZoomButton, StyledZoomHolder } from './styled'
import { VizItem } from './types'
import {
  ZoomInIcon,
  ZoomOutIcon,
  ZoomToFitIcon
} from 'browser-components/icons/Icons'
import { ZoomLimitsReached } from 'project-root/src/browser/modules/D3Visualization/lib/visualization/components/Visualization'
import { GlobalState } from 'project-root/src/shared/globalState'
import { shouldShowWheelZoomInfo } from 'project-root/src/shared/modules/settings/settingsDuck'
import * as actions from 'project-root/src/shared/modules/settings/settingsDuck'
import { BasicNode, BasicRelationship } from 'services/bolt/boltMappings'

const DISPLAY_WHEEL_ZOOM_INFO_DURATION_MS = 3000

type GraphProps = {
  isFullscreen: boolean
  relationships: BasicRelationship[]
  nodes: BasicNode[]
  getNodeNeighbours: GetNodeNeighboursFn
  onItemMouseOver: (item: VizItem) => void
  onItemSelect: (item: VizItem) => void
  graphStyle: GraphStyle
  styleVersion: number
  onGraphModelChange: (stats: GraphStats) => void
  assignVisElement: (svgElement: any, graphElement: any) => void
  getAutoCompleteCallback: (
    callback: (internalRelationships: BasicRelationship[]) => void
  ) => void
  setGraph: (graph: Graph) => void
  offset: number
  shouldShowWheelZoomInfo: boolean
  updateShouldShowWheelZoomInfo: (showWheelZoomInfo: boolean) => void
}

type GraphState = {
  zoomInLimitReached: boolean
  zoomOutLimitReached: boolean
  displayWheelZoomInfoMessage: boolean
}

class GraphComponent extends React.Component<GraphProps, GraphState> {
  svgElement: React.RefObject<SVGSVGElement>
  graphView: GraphView | null = null
  displayWheelZoomInfoTimerId: number | undefined

  constructor(props: GraphProps) {
    super(props)
    this.state = {
      zoomInLimitReached: false,
      zoomOutLimitReached: false,
      displayWheelZoomInfoMessage: false
    }
    this.svgElement = React.createRef()
  }

  componentDidMount(): void {
    const {
      nodes,
      relationships,
      graphStyle,
      getNodeNeighbours,
      onItemMouseOver,
      onItemSelect,
      onGraphModelChange,
      setGraph,
      getAutoCompleteCallback,
      assignVisElement,
      isFullscreen
    } = this.props

    if (!this.svgElement.current) return

    const measureSize = () => ({
      width: this.svgElement.current?.parentElement?.clientWidth ?? 200,
      height: this.svgElement.current?.parentElement?.clientHeight ?? 200
    })

    const graph = createGraph(nodes, relationships)
    this.graphView = new GraphView(
      this.svgElement.current,
      measureSize,
      this.handleZoomEvent,
      this.handleDisplayZoomWheelInfoMessage,
      graph,
      graphStyle,
      isFullscreen
    )

    const graphEventHandler = new GraphEventHandler(
      graph,
      this.graphView,
      getNodeNeighbours,
      onItemMouseOver,
      onItemSelect,
      onGraphModelChange
    )
    graphEventHandler.bindEventHandlers()

    onGraphModelChange(getGraphStats(graph))
    this.graphView.resize(isFullscreen)
    this.graphView.init()

    if (setGraph) {
      setGraph(graph)
    }
    if (getAutoCompleteCallback) {
      getAutoCompleteCallback((internalRelationships: BasicRelationship[]) => {
        graph.addInternalRelationships(
          mapRelationships(internalRelationships, graph)
        )
        onGraphModelChange(getGraphStats(graph))
        this.graphView?.update({
          updateNodes: false,
          updateRelationships: true
        })
        graphEventHandler.onItemMouseOut()
      })
    }
    if (assignVisElement) {
      assignVisElement(this.svgElement.current, this.graphView)
    }
  }

  componentDidUpdate(prevProps: GraphProps): void {
    if (this.props.isFullscreen !== prevProps.isFullscreen) {
      this.graphView?.resize(this.props.isFullscreen)
    }

    if (this.props.styleVersion !== prevProps.styleVersion) {
      this.graphView?.init()
    }
  }

  componentWillUnmount(): void {
    clearTimeout(this.displayWheelZoomInfoTimerId)
  }

  handleZoomEvent = (limitsReached: ZoomLimitsReached): void => {
    if (
      limitsReached.zoomInLimitReached !== this.state.zoomInLimitReached ||
      limitsReached.zoomOutLimitReached !== this.state.zoomOutLimitReached
    ) {
      this.setState({
        zoomInLimitReached: limitsReached.zoomInLimitReached,
        zoomOutLimitReached: limitsReached.zoomOutLimitReached
      })
    }
  }

  handleDisplayZoomWheelInfoMessage = (): void => {
    if (
      !this.state.displayWheelZoomInfoMessage &&
      this.props.shouldShowWheelZoomInfo
    ) {
      this.displayZoomWheelInfoMessage(true)
      setTimeout(
        this.displayZoomWheelInfoMessage,
        DISPLAY_WHEEL_ZOOM_INFO_DURATION_MS,
        false
      )
    }
  }

  displayZoomWheelInfoMessage = (show: boolean): void => {
    this.setState({ displayWheelZoomInfoMessage: show })
  }

  updateShouldShowWheelZoomInfo = (show: boolean): void => {
    this.props.updateShouldShowWheelZoomInfo(show)
  }

  zoomInClicked = (): void => {
    if (this.graphView) {
      this.graphView.zoomIn()
    }
  }

  zoomOutClicked = (): void => {
    if (this.graphView) {
      this.graphView.zoomOut()
    }
  }

  zoomToFitClicked = (): void => {
    if (this.graphView) {
      this.graphView.zoomToFit()
    }
  }

  render(): JSX.Element {
    const { offset, isFullscreen, shouldShowWheelZoomInfo } = this.props
    const {
      zoomInLimitReached,
      zoomOutLimitReached,
      displayWheelZoomInfoMessage
    } = this.state
    return (
      <StyledSvgWrapper>
        <svg className="neod3viz" ref={this.svgElement} />
        <StyledZoomHolder offset={offset} isFullscreen={isFullscreen}>
          <StyledZoomButton
            aria-label={'zoom-in'}
            className={zoomInLimitReached ? 'faded zoom-in' : 'zoom-in'}
            onClick={this.zoomInClicked}
          >
            <ZoomInIcon large={isFullscreen} />
          </StyledZoomButton>
          <StyledZoomButton
            aria-label={'zoom-out'}
            className={zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out'}
            onClick={this.zoomOutClicked}
          >
            <ZoomOutIcon large={isFullscreen} />
          </StyledZoomButton>
          <StyledZoomButton
            aria-label={'zoom-to-fit'}
            onClick={this.zoomToFitClicked}
          >
            <ZoomToFitIcon large={isFullscreen} />
          </StyledZoomButton>
        </StyledZoomHolder>
        {shouldShowWheelZoomInfo && (
          <WheelZoomInfoOverlay
            hide={isFullscreen || !displayWheelZoomInfoMessage}
            onShouldShowUpdate={this.updateShouldShowWheelZoomInfo}
          />
        )}
      </StyledSvgWrapper>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  shouldShowWheelZoomInfo: shouldShowWheelZoomInfo(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  updateShouldShowWheelZoomInfo: (showWheelZoomInfo: boolean) => {
    dispatch(actions.update({ showWheelZoomInfo: showWheelZoomInfo }))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(GraphComponent)
