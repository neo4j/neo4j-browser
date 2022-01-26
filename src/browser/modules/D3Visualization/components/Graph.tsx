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
import { StyledSvgWrapper, StyledZoomButton, StyledZoomHolder } from './styled'
import { VizItem } from './types'
import { ZoomInIcon, ZoomOutIcon } from 'browser-components/icons/Icons'
import { BasicNode, BasicRelationship } from 'services/bolt/boltMappings'

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
}

export class GraphComponent extends React.Component<GraphProps> {
  svgElement: React.RefObject<SVGSVGElement>
  graphView: GraphView | null = null

  constructor(props: GraphProps) {
    super(props)
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
      assignVisElement
    } = this.props

    const measureSize = () => ({
      width: this.svgElement.current?.parentElement?.clientWidth ?? 200,
      height: this.svgElement.current?.parentElement?.clientHeight ?? 200
    })

    const graph = createGraph(nodes, relationships)
    const graphView = new GraphView(
      this.svgElement.current,
      measureSize,
      graph,
      graphStyle
    )

    const graphEventHandler = new GraphEventHandler(
      graph,
      graphView,
      getNodeNeighbours,
      onItemMouseOver,
      onItemSelect,
      onGraphModelChange
    )
    graphEventHandler.bindEventHandlers()

    onGraphModelChange(getGraphStats(graph))
    graphView.resize()
    graphView.init()

    if (setGraph) {
      setGraph(graph)
    }
    if (getAutoCompleteCallback) {
      getAutoCompleteCallback((internalRelationships: BasicRelationship[]) => {
        graph.addInternalRelationships(
          mapRelationships(internalRelationships, graph)
        )
        onGraphModelChange(getGraphStats(graph))
        graphView.update({ updateNodes: false, updateRelationships: true })
        graphEventHandler.onItemMouseOut()
      })
    }
    if (assignVisElement) {
      assignVisElement(this.svgElement.current, graphView)
    }
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

  render(): JSX.Element {
    const { offset, isFullscreen } = this.props
    return (
      <StyledSvgWrapper>
        <svg className="neod3viz" ref={this.svgElement} />
        <StyledZoomHolder offset={offset} isFullscreen={isFullscreen}>
          <StyledZoomButton className="zoom-in" onClick={this.zoomInClicked}>
            <ZoomInIcon regulateSize={isFullscreen ? 2 : 1} />
          </StyledZoomButton>
          <StyledZoomButton className="zoom-out" onClick={this.zoomOutClicked}>
            <ZoomOutIcon regulateSize={isFullscreen ? 2 : 1} />
          </StyledZoomButton>
        </StyledZoomHolder>
      </StyledSvgWrapper>
    )
  }

  componentDidUpdate(prevProps: GraphProps): void {
    if (this.props.isFullscreen !== prevProps.isFullscreen) {
      this.graphView?.resize()
    }

    if (this.props.styleVersion !== prevProps.styleVersion) {
      this.graphView?.init()
    }
  }
}
