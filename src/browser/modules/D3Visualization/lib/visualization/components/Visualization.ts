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
import { D3ZoomEvent, ZoomBehavior, zoom as d3Zoom } from 'd3-zoom'

import { ZOOM_SCALE_EXTENT } from '../constants'
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
  relationshipEventHandlers,
  zoomEventHandler
} from './mouseEventHandlers'
import GraphStyle from 'browser/modules/D3Visualization/graphStyle'

export type MeasureSizeFn = () => { width: number; height: number }

export class Visualization<T extends Element = SVGElement> {
  private root: Selection<T, unknown, BaseType, unknown>
  private baseGroup: Selection<SVGGElement, unknown, BaseType, unknown>
  private rect: Selection<SVGRectElement, unknown, BaseType, unknown>
  private container: Selection<SVGGElement, unknown, BaseType, unknown>
  private geometry: GraphGeometry
  private zoomBehavior: ZoomBehavior<SVGGElement, unknown>

  forceSim: ForceSimulation

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  private draw = false
  private isZoomClick = false

  constructor(
    element: T,
    private measureSize: MeasureSizeFn,
    private graph: Graph,
    public style: GraphStyle,
    public trigger: (event: string, ...args: any[]) => void
  ) {
    this.root = d3Select(element)

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

    this.zoomBehavior = d3Zoom<SVGGElement, unknown>()
      .scaleExtent(ZOOM_SCALE_EXTENT)
      .on('zoom', (e: D3ZoomEvent<SVGGElement, unknown>) => {
        const isZoomClick = this.isZoomClick
        this.draw = true
        this.isZoomClick = false

        return this.container
          .transition()
          .duration(isZoomClick ? 400 : 20)
          .call(sel => (isZoomClick ? sel.ease(easeCubic) : sel))
          .attr('transform', String(e.transform))
      })

    this.baseGroup
      .call(this.zoomBehavior)
      .call(zoomEventHandler, this.baseGroup, this.zoomBehavior)
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

  private zoomClick(isZoomingIn: boolean) {
    this.draw = true
    this.isZoomClick = true
    const limitsReached = { zoomInLimit: false, zoomOutLimit: false }

    this.zoomBehavior.scaleBy(this.baseGroup, isZoomingIn ? 1.3 : 0.7)

    return limitsReached
  }

  init() {
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
  }) {
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

  boundingBox() {
    return this.container.node()?.getBBox()
  }

  resize() {
    const size = this.measureSize()

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

  zoomInClick() {
    return this.zoomClick(true)
  }

  zoomOutClick() {
    return this.zoomClick(false)
  }
}
