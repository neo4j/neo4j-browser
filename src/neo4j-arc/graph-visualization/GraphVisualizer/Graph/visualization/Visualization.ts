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
} from '../../../constants'
import { GraphModel } from '../../../models/Graph'
import { GraphGeometryModel } from './GraphGeometryModel'
import { GraphStyleModel } from '../../../models/GraphStyle'
import { NodeModel } from '../../../models/Node'
import { RelationshipModel } from '../../../models/Relationship'
import { isNullish } from '../../../utils/utils'
import { ForceSimulation } from './ForceSimulation'
import {
  nodeEventHandlers,
  relationshipEventHandlers
} from './mouseEventHandlers'
import {
  node as nodeRenderer,
  relationship as relationshipRenderer
} from './renderers/init'
import { nodeMenuRenderer } from './renderers/menu'
import { ZoomLimitsReached, ZoomType } from '../../../types'

type MeasureSizeFn = () => { width: number; height: number }

export class Visualization {
  private readonly root: Selection<SVGElement, unknown, BaseType, unknown>
  private baseGroup: Selection<SVGGElement, unknown, BaseType, unknown>
  private rect: Selection<SVGRectElement, unknown, BaseType, unknown>
  private container: Selection<SVGGElement, unknown, BaseType, unknown>
  private geometry: GraphGeometryModel
  private zoomBehavior: ZoomBehavior<SVGElement, unknown>
  private zoomMinScaleExtent: number = ZOOM_MIN_SCALE
  private callbacks: Record<
    string,
    undefined | Array<(...args: any[]) => void>
  > = {}

  forceSimulation: ForceSimulation

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  private draw = false
  private isZoomClick = false

  constructor(
    element: SVGElement,
    private measureSize: MeasureSizeFn,
    onZoomEvent: (limitsReached: ZoomLimitsReached) => void,
    onDisplayZoomWheelInfoMessage: () => void,
    private graph: GraphModel,
    public style: GraphStyleModel,
    public isFullscreen: boolean,
    public wheelZoomRequiresModKey?: boolean,
    private initialZoomToFit?: boolean
  ) {
    this.root = d3Select(element)

    this.isFullscreen = isFullscreen
    this.wheelZoomRequiresModKey = wheelZoomRequiresModKey

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
    this.geometry = new GraphGeometryModel(style)

    this.zoomBehavior = d3Zoom<SVGElement, unknown>()
      .scaleExtent([this.zoomMinScaleExtent, ZOOM_MAX_SCALE])
      .on('zoom', (e: D3ZoomEvent<SVGElement, unknown>) => {
        const isZoomClick = this.isZoomClick
        this.draw = true
        this.isZoomClick = false

        const currentZoomScale = e.transform.k
        const limitsReached: ZoomLimitsReached = {
          zoomInLimitReached: currentZoomScale >= ZOOM_MAX_SCALE,
          zoomOutLimitReached: currentZoomScale <= this.zoomMinScaleExtent
        }
        onZoomEvent(limitsReached)

        return this.container
          .transition()
          .duration(isZoomClick ? 400 : 20)
          .call(sel => (isZoomClick ? sel.ease(easeCubic) : sel))
          .attr('transform', String(e.transform))
      })
      // This is the default implementation of wheelDelta function in d3-zoom v3.0.0
      // For some reasons typescript complains when trying to get it by calling zoomBehaviour.wheelDelta() instead
      // but it should be the same (and indeed it works at runtime).
      // https://github.com/d3/d3-zoom/blob/1bccd3fd56ea24e9658bd7e7c24e9b89410c8967/README.md#zoom_wheelDelta
      // Keps the zoom behavior constant for metam ctrl and shift key. Otherwise scrolling is faster with ctrl key.
      .wheelDelta(
        e => -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002)
      )
      .filter(e => {
        if (e.type === 'wheel') {
          const modKeySelected = e.metaKey || e.ctrlKey || e.shiftKey
          if (this.wheelZoomRequiresModKey && !modKeySelected) {
            onDisplayZoomWheelInfoMessage()
            return false
          }
        }
        return true
      })

    this.root
      .call(this.zoomBehavior)
      // Single click is not panning
      .on('click.zoom', () => (this.draw = false))
      .on('dblclick.zoom', null)

    this.forceSimulation = new ForceSimulation(this.render.bind(this))
  }

  private render() {
    this.geometry.onTick(this.graph)

    const nodeGroups = this.container
      .selectAll<SVGGElement, NodeModel>('g.node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    nodeRenderer.forEach(renderer => nodeGroups.call(renderer.onTick, this))

    const relationshipGroups = this.container
      .selectAll<SVGGElement, RelationshipModel>('g.relationship')
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
      .selectAll<SVGGElement, NodeModel>('g.node')
      .data(nodes, d => d.id)
      .join('g')
      .attr('class', 'node')
      .attr('aria-label', d => `graph-node${d.id}`)
      .call(nodeEventHandlers, this.trigger, this.forceSimulation.simulation)
      .classed('selected', node => node.selected)

    nodeRenderer.forEach(renderer =>
      nodeGroups.call(renderer.onGraphChange, this)
    )

    nodeMenuRenderer.forEach(renderer =>
      nodeGroups.call(renderer.onGraphChange, this)
    )

    this.forceSimulation.updateNodes(this.graph)
    this.forceSimulation.updateRelationships(this.graph)
  }

  private updateRelationships() {
    const relationships = this.graph.relationships()
    this.geometry.onGraphChange(this.graph, {
      updateNodes: false,
      updateRelationships: true
    })

    const relationshipGroups = this.container
      .select('g.layer.relationships')
      .selectAll<SVGGElement, RelationshipModel>('g.relationship')
      .data(relationships, d => d.id)
      .join('g')
      .attr('class', 'relationship')
      .call(relationshipEventHandlers, this.trigger)
      .classed('selected', relationship => relationship.selected)

    relationshipRenderer.forEach(renderer =>
      relationshipGroups.call(renderer.onGraphChange, this)
    )

    this.forceSimulation.updateRelationships(this.graph)
  }

  zoomByType = (zoomType: ZoomType): void => {
    this.draw = true
    this.isZoomClick = true

    if (zoomType === ZoomType.IN) {
      this.zoomBehavior.scaleBy(this.root, 1.3)
    } else if (zoomType === ZoomType.OUT) {
      this.zoomBehavior.scaleBy(this.root, 0.7)
    } else if (zoomType === ZoomType.FIT) {
      this.zoomToFitViewport()
      this.adjustZoomMinScaleExtentToFitGraph(1)
    }
  }

  private zoomToFitViewport = () => {
    const scaleAndOffset = this.getZoomScaleFactorToFitWholeGraph()
    if (scaleAndOffset) {
      const { scale, centerPointOffset } = scaleAndOffset
      // Do not zoom in more than zoom max scale for really small graphs
      this.zoomBehavior.transform(
        this.root,
        zoomIdentity
          .scale(Math.min(scale, ZOOM_MAX_SCALE))
          .translate(centerPointOffset.x, centerPointOffset.y)
      )
    }
  }

  private getZoomScaleFactorToFitWholeGraph = ():
    | { scale: number; centerPointOffset: { x: number; y: number } }
    | undefined => {
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

      const centerPointOffset = { x: -graphCenterX, y: -graphCenterY }

      return { scale: scale, centerPointOffset: centerPointOffset }
    }
    return
  }

  private adjustZoomMinScaleExtentToFitGraph = (
    padding_factor = 0.75
  ): void => {
    const scaleAndOffset = this.getZoomScaleFactorToFitWholeGraph()
    const scaleToFitGraphWithPadding = scaleAndOffset
      ? scaleAndOffset.scale * padding_factor
      : this.zoomMinScaleExtent
    if (scaleToFitGraphWithPadding <= this.zoomMinScaleExtent) {
      this.zoomMinScaleExtent = scaleToFitGraphWithPadding
      this.zoomBehavior.scaleExtent([
        scaleToFitGraphWithPadding,
        ZOOM_MAX_SCALE
      ])
    }
  }

  on = (event: string, callback: (...args: any[]) => void): this => {
    if (isNullish(this.callbacks[event])) {
      this.callbacks[event] = []
    }

    this.callbacks[event]?.push(callback)
    return this
  }

  trigger = (event: string, ...args: any[]): void => {
    const callbacksForEvent = this.callbacks[event] ?? []
    callbacksForEvent.forEach(callback => callback.apply(null, args))
  }

  init(): void {
    this.container
      .selectAll('g.layer')
      .data(['relationships', 'nodes'])
      .join('g')
      .attr('class', d => `layer ${d}`)

    this.updateNodes()
    this.updateRelationships()

    this.adjustZoomMinScaleExtentToFitGraph()
    this.setInitialZoom()
  }

  setInitialZoom(): void {
    const count = this.graph.nodes().length

    // chosen by *feel* (graph fitting guesstimate)
    const scale = -0.02364554 + 1.913 / (1 + (count / 12.7211) ** 0.8156444)
    this.zoomBehavior.scaleBy(this.root, Math.max(0, scale))
  }

  precomputeAndStart(): void {
    this.forceSimulation.precomputeAndStart(
      () => this.initialZoomToFit && this.zoomByType(ZoomType.FIT)
    )
  }

  update(options: {
    updateNodes: boolean
    updateRelationships: boolean
    restartSimulation?: boolean
  }): void {
    if (options.updateNodes) {
      this.updateNodes()
    }

    if (options.updateRelationships) {
      this.updateRelationships()
    }

    if (options.restartSimulation ?? true) {
      this.forceSimulation.restart()
    }
    this.trigger('updated')
  }

  boundingBox(): DOMRect | undefined {
    return this.container.node()?.getBBox()
  }

  resize(isFullscreen: boolean, wheelZoomRequiresModKey: boolean): void {
    const size = this.measureSize()
    this.isFullscreen = isFullscreen
    this.wheelZoomRequiresModKey = wheelZoomRequiresModKey

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
}
