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
import React, { useEffect, useRef, useState } from 'react'

import { GetNodeNeighboursFn, GraphEventHandler } from '../GraphEventHandler'
import GraphStyle from '../graphStyle'
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
  styleVersion: any
  onGraphModelChange: (stats: GraphStats) => void
  assignVisElement: any
  getAutoCompleteCallback: any
  setGraph: any
  offset: any
}

export function GraphComponent(props: GraphProps) {
  const svgElement = useRef<SVGSVGElement>(null)
  const [graphView, setGraphView] = useState<GraphView | null>(null)

  useEffect(() => {
    const measureSize = () => ({
      width: svgElement.current?.parentElement?.clientWidth ?? 200,
      height: svgElement.current?.parentElement?.clientHeight ?? 200
    })

    const graph = createGraph(props.nodes, props.relationships)
    const graphView = new GraphView(
      svgElement.current,
      measureSize,
      graph,
      props.graphStyle
    )

    const graphEventHandler = new GraphEventHandler(
      graph,
      graphView,
      props.getNodeNeighbours,
      props.onItemMouseOver,
      props.onItemSelect,
      props.onGraphModelChange
    )
    graphEventHandler.bindEventHandlers()

    props.onGraphModelChange(getGraphStats(graph))
    graphView.resize()
    graphView.init()

    props.setGraph && props.setGraph(graph)
    props.getAutoCompleteCallback &&
      props.getAutoCompleteCallback(
        (internalRelationships: BasicRelationship[]) => {
          graph.addInternalRelationships(
            mapRelationships(internalRelationships, graph)
          )
          props.onGraphModelChange(getGraphStats(graph))
          graphView?.update({ updateNodes: false, updateRelationships: true })
          graphEventHandler?.onItemMouseOut()
        }
      )
    props.assignVisElement && props.assignVisElement(svgElement, graphView)

    setGraphView(graphView)
  }, [svgElement.current])

  useEffect(() => graphView?.init(), [svgElement.current, props.styleVersion])
  useEffect(() => graphView?.resize(), [svgElement.current, props.isFullscreen])

  const zoomInClicked = (): void => {
    if (graphView) {
      graphView.zoomIn()
    }
  }

  const zoomOutClicked = (): void => {
    if (graphView) {
      graphView.zoomOut()
    }
  }

  return (
    <StyledSvgWrapper>
      <svg className="neod3viz" ref={svgElement} />
      <StyledZoomHolder offset={props.offset} isFullscreen={props.isFullscreen}>
        <StyledZoomButton className="zoom-in" onClick={zoomInClicked}>
          <ZoomInIcon regulateSize={props.isFullscreen ? 2 : 1} />
        </StyledZoomButton>
        <StyledZoomButton className="zoom-out" onClick={zoomOutClicked}>
          <ZoomOutIcon regulateSize={props.isFullscreen ? 2 : 1} />
        </StyledZoomButton>
      </StyledZoomHolder>
    </StyledSvgWrapper>
  )
}
