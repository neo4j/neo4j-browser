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
import { easeCubic } from 'd3-ease'
import { BaseType, Selection, select as d3Select } from 'd3-selection'
import {
  D3ZoomEvent,
  ZoomBehavior,
  zoom as d3Zoom,
  zoomIdentity
} from 'd3-zoom'

import {
  ZOOM_FIT_PADDING_PERCENT,
  ZOOM_MAX_SCALE,
  ZOOM_MIN_SCALE
} from '../constants'
import {
  node as nodeRenderer,
  relationship as relationshipRenderer
} from '../renders/init'
import { nodeMenuRenderer } from '../renders/menu'
import { ForceSimulation } from './ForceSimulation'
import Graph from './Graph'
import GraphGeometry from './GraphGeometry'
import Relationship from './Relationship'
import VizNode from './VizNode'
import {
  nodeEventHandlers,
  relationshipEventHandlers
} from './mouseEventHandlers'
import GraphStyle from 'browser/modules/D3Visualization/graphStyle'

export type MeasureSizeFn = () => { width: number; height: number }

export type ZoomLimitsReached = {
  zoomInLimitReached: boolean
  zoomOutLimitReached: boolean
}

enum ZoomType {
  IN = 'in',
  OUT = 'out',
  FIT = 'fit'
}

export class Visualization {
  private readonly root: Selection<SVGElement, unknown, BaseType, unknown>
  private baseGroup: Selection<SVGGElement, unknown, BaseType, unknown>
  private rect: Selection<SVGRectElement, unknown, BaseType, unknown>
  private container: Selection<SVGGElement, unknown, BaseType, unknown>
  private geometry: GraphGeometry
  private zoomBehavior: ZoomBehavior<SVGElement, unknown>

  forceSim: ForceSimulation

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  private draw = false
  private isZoomClick = false

  constructor(
    element: SVGElement,
    private measureSize: MeasureSizeFn,
    private onZoomEvent: (limitsReached: ZoomLimitsReached) => void,
    private graph: Graph,
    public style: GraphStyle,
    public isFullscreen: boolean,
    public trigger: (event: string, ...args: any[]) => void
  ) {
    this.root = d3Select(element)

    this.isFullscreen = isFullscreen

    // Remove the base group element when re-creating the visualization
    this.root.selectAll('g').remove()
    this.baseGroup = this.root.append('g').attr('transform', 'translate(0,0)')

    this.rect = this.baseGroup
      .append('rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      // Make the rect cover the whole surface, center of the svg viewbox is in (0,0)
      .attr('x', () => -Math.floor(measureSize().width / 2))
      .attr('y', () => -Math.floor(measureSize().height / 2))
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('transform', 'scale(1)')
      // Background click event
      // Check if panning is ongoing
      .on('click', () => {
        if (!this.draw) {
          return this.trigger('canvasClicked')
        }
      })

    this.container = this.baseGroup.append('g')
    this.geometry = new GraphGeometry(style)

    this.zoomBehavior = d3Zoom<SVGElement, unknown>()
      .scaleExtent([ZOOM_MIN_SCALE, ZOOM_MAX_SCALE])
      .on('zoom', (e: D3ZoomEvent<SVGElement, unknown>) => {
        const isZoomClick = this.isZoomClick
        this.draw = true
        this.isZoomClick = false

        const currentZoomScale = e.transform.k
        const limitsReached: ZoomLimitsReached = {
          zoomInLimitReached: currentZoomScale >= ZOOM_MAX_SCALE,
          zoomOutLimitReached: currentZoomScale <= ZOOM_MIN_SCALE
        }
        onZoomEvent(limitsReached)

        return this.container
          .transition()
          .duration(isZoomClick ? 400 : 20)
          .call(sel => (isZoomClick ? sel.ease(easeCubic) : sel))
          .attr('transform', String(e.transform))
      })

    const zoomEventHandler = (
      selection: Selection<SVGElement, unknown, BaseType, unknown>
    ) => {
      const handleZoomOnShiftScroll = (e: WheelEvent) => {
        const modKeySelected = e.metaKey || e.ctrlKey || e.shiftKey
        if (modKeySelected || this.isFullscreen) {
          e.preventDefault()

          // This is the default implementation of wheelDelta function in d3-zoom v3.0.0
          // For some reasons typescript complains when trying to get it by calling zoomBehaviour.wheelDelta() instead
          // but it should be the same (and indeed it works at runtime).
          // https://github.com/d3/d3-zoom/blob/1bccd3fd56ea24e9658bd7e7c24e9b89410c8967/README.md#zoom_wheelDelta
          const delta =
            -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002)

          return this.zoomBehavior.scaleBy(this.root, 1 + delta)
        }
      }

      return selection
        .on('dblclick.zoom', null)
        .on('DOMMouseScroll.zoom', handleZoomOnShiftScroll)
        .on('wheel.zoom', handleZoomOnShiftScroll)
        .on('mousewheel.zoom', handleZoomOnShiftScroll)
    }

    this.root
      .call(this.zoomBehavior)
      .call(zoomEventHandler)
      // Single click is not panning
      .on('click.zoom', () => (this.draw = false))

    this.forceSim = new ForceSimulation(this.render.bind(this))
  }

  private render() {
    this.geometry.onTick(this.graph)

    const nodeGroups = this.container
      .selectAll<SVGGElement, VizNode>('g.node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    nodeRenderer.forEach(renderer => nodeGroups.call(renderer.onTick, this))

    const relationshipGroups = this.container
      .selectAll<SVGGElement, Relationship>('g.relationship')
      .attr(
        'transform',
        d =>
          `translate(${d.source.x} ${d.source.y}) rotate(${
            d.naturalAngle + 180
          })`
      )

    relationshipRenderer.forEach(renderer =>
      relationshipGroups.call(renderer.onTick, this)
    )
  }

  private updateNodes() {
    const nodes = this.graph.nodes()
    this.geometry.onGraphChange(this.graph, {
      updateNodes: true,
      updateRelationships: false
    })

    const nodeGroups = this.container
      .select('g.layer.nodes')
      .selectAll<SVGGElement, VizNode>('g.node')
      .data(nodes, d => d.id)
      .join('g')
      .attr('class', 'node')
      .attr('aria-label', d => `graph-node${d.id}`)
      .call(nodeEventHandlers, this.trigger, this.forceSim.simulation)
      .classed('selected', node => node.selected)

    nodeRenderer.forEach(renderer =>
      nodeGroups.call(renderer.onGraphChange, this)
    )

    nodeMenuRenderer.forEach(renderer =>
      nodeGroups.call(renderer.onGraphChange, this)
    )

    this.forceSim.updateNodes(this.graph)
    this.forceSim.updateRelationships(this.graph)
  }

  private updateRelationships() {
    const relationships = this.graph.relationships()
    this.geometry.onGraphChange(this.graph, {
      updateNodes: false,
      updateRelationships: true
    })

    const relationshipGroups = this.container
      .select('g.layer.relationships')
      .selectAll<SVGGElement, Relationship>('g.relationship')
      .data(relationships, d => d.id)
      .join('g')
      .attr('class', 'relationship')
      .call(relationshipEventHandlers, this.trigger)
      .classed('selected', relationship => relationship.selected)

    relationshipRenderer.forEach(renderer =>
      relationshipGroups.call(renderer.onGraphChange, this)
    )

    this.forceSim.updateRelationships(this.graph)
  }

  private handleZoomClick(zoomType: ZoomType): void {
    this.draw = true
    this.isZoomClick = true

    if (zoomType === ZoomType.IN) {
      this.zoomBehavior.scaleBy(this.root, 1.3)
    } else if (zoomType === ZoomType.OUT) {
      this.zoomBehavior.scaleBy(this.root, 0.7)
    } else if (zoomType === ZoomType.FIT) {
      this.zoomToFitWholeGraph()
    }
  }

  private zoomToFitWholeGraph = () => {
    const graphSize = this.container.node()?.getBBox()
    const availableWidth = this.root.node()?.clientWidth
    const availableHeight = this.root.node()?.clientHeight

    if (graphSize && availableWidth && availableHeight) {
      const graphWidth = graphSize.width
      const graphHeight = graphSize.height

      const graphCenterX = graphSize.x + graphWidth / 2
      const graphCenterY = graphSize.y + graphHeight / 2

      if (graphWidth === 0 || graphHeight === 0) return

      const scale =
        (1 - ZOOM_FIT_PADDING_PERCENT) /
        Math.max(graphWidth / availableWidth, graphHeight / availableHeight)

      this.zoomBehavior.transform(
        this.root,
        zoomIdentity
          .scale(Math.min(scale, ZOOM_MAX_SCALE))
          .translate(-graphCenterX, -graphCenterY)
      )
    }
  }

  init(): void {
    this.container
      .selectAll('g.layer')
      .data(['relationships', 'nodes'])
      .join('g')
      .attr('class', d => `layer ${d}`)

    this.updateNodes()
    this.updateRelationships()
    this.forceSim.precompute()
  }

  update(options: {
    updateNodes: boolean
    updateRelationships: boolean
    restartSimulation: boolean
  }): void {
    if (options.updateNodes) {
      this.updateNodes()
    }

    if (options.updateRelationships) {
      this.updateRelationships()
    }

    if (options.restartSimulation) {
      this.forceSim.restart()
    }
    this.trigger('updated')
  }

  boundingBox(): DOMRect | undefined {
    return this.container.node()?.getBBox()
  }

  resize(isFullscreen: boolean): void {
    const size = this.measureSize()
    this.isFullscreen = isFullscreen

    this.rect
      .attr('x', () => -Math.floor(size.width / 2))
      .attr('y', () => -Math.floor(size.height / 2))

    this.root.attr(
      'viewBox',
      [
        -Math.floor(size.width / 2),
        -Math.floor(size.height / 2),
        size.width,
        size.height
      ].join(' ')
    )
  }

  zoomInClick(): void {
    this.handleZoomClick(ZoomType.IN)
  }

  zoomOutClick(): void {
    this.handleZoomClick(ZoomType.OUT)
  }

  zoomToFitClick(): void {
    this.handleZoomClick(ZoomType.FIT)
  }
}
