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
import { D3DragEvent, drag as d3Drag } from 'd3-drag'
import { easeCubic } from 'd3-ease'
import { Simulation } from 'd3-force'
import { BaseType, select as d3Select } from 'd3-selection'
import { Transition } from 'd3-transition'
import { D3ZoomEvent, zoom as d3Zoom } from 'd3-zoom'

import * as vizRenderers from '../renders/init'
import { nodeMenuRenderer } from '../renders/menu'
import Graph from './Graph'
import GraphGeometry from './GraphGeometry'
import Relationship from './Relationship'
import VizNode from './VizNode'
import { Layout, clearSimulationTimeout, setSimulationTimeout } from './layout'
import GraphStyle from 'browser/modules/D3Visualization/graphStyle'

type StatsBucket = {
  frameCount: number
  geometry: number
  relationshipRenderers: Record<string, number>
  duration: () => number
  fps: () => string
  lps: () => string
  top: () => string
  lastFrame?: number
  firstFrame?: number
  layout: { layoutSteps: number; layoutTime: number }
}
export type MeasureSizeFn = () => { width: number; height: number }
export type VizObj = {
  style: any
  trigger: (_event: any, ..._args: any[]) => void
  zoomInClick: (el: any) => { zoomInLimit: boolean; zoomOutLimit: boolean }
  zoomOutClick: (el: any) => { zoomInLimit: boolean; zoomOutLimit: boolean }
  boundingBox: () => void
  resize: () => void
  collectStats: () => void
  update: (options: {
    updateNodes: boolean
    updateRelationships: boolean
    precompute?: boolean
  }) => void
}

const noOp = () => undefined
const vizFn = function (
  el: SVGElement,
  measureSize: MeasureSizeFn,
  graph: Graph,
  layout: Layout,
  style: GraphStyle
): VizObj {
  const viz: VizObj = {
    style,
    // to be overwritten externally
    trigger: noOp,
    // to be defined later in this file, adding now for type safety
    zoomInClick: () => ({
      zoomInLimit: false,
      zoomOutLimit: false
    }),
    zoomOutClick: () => ({
      zoomInLimit: false,
      zoomOutLimit: false
    }),
    boundingBox: noOp,
    resize: noOp,
    collectStats: noOp,
    update: noOp
  }

  const root = d3Select(el)
  const baseGroup = root.append('g').attr('transform', 'translate(0,0)')
  const rect = baseGroup
    .append('rect')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    // Make the rect cover the whole surface
    .attr('x', '-2500')
    .attr('y', '-2500')
    .attr('width', '5000')
    .attr('height', '5000')
    .attr('transform', 'scale(1)')

  const container = baseGroup.append('g')
  const geometry = new GraphGeometry(style)

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  let draw = false

  // Arbitrary dimension used to keep force layout aligned with
  // the centre of the svg view-port.
  const layoutDimension = 200

  let updateViz = true
  let isZoomClick = false

  const onNodeClick = (_event: Event, node: VizNode) => {
    updateViz = false
    return viz.trigger('nodeClicked', node)
  }

  const onNodeDblClick = (_event: Event, node: VizNode) =>
    viz.trigger('nodeDblClicked', node)

  const onRelationshipClick = function (
    event: Event,
    relationship: Relationship
  ) {
    event.stopPropagation()
    updateViz = false
    return viz.trigger('relationshipClicked', relationship)
  }

  const onNodeMouseOver = (_event: Event, node: VizNode) =>
    viz.trigger('nodeMouseOver', node)

  const onNodeMouseOut = (_event: Event, node: VizNode) =>
    viz.trigger('nodeMouseOut', node)

  const onRelMouseOver = (_event: Event, rel: Relationship) =>
    viz.trigger('relMouseOver', rel)

  const onRelMouseOut = (_event: Event, rel: Relationship) =>
    viz.trigger('relMouseOut', rel)

  const handleZoomOnShiftScroll = (e: WheelEvent) => {
    if (e.shiftKey) {
      const delta =
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002)

      return zoomBehavior.scaleBy(baseGroup, 1 + delta)
    }
  }

  const zoomed = function (
    e: D3ZoomEvent<SVGGElement, unknown>
  ): Transition<SVGGElement, unknown, null, undefined> {
    draw = true

    if (isZoomClick) {
      // When clicking on the zoom buttons show a longer animation than when
      // using the scroll wheel.
      isZoomClick = false

      return container
        .transition()
        .duration(400)
        .ease(easeCubic)
        .attr('transform', String(e.transform))
    }

    return container
      .transition()
      .duration(20)
      .attr('transform', String(e.transform))
  }

  const zoomBehavior = d3Zoom<SVGGElement, unknown>()
    .scaleExtent([0.1, 2])
    .on('zoom', zoomed)

  let isZoomingIn = true

  viz.zoomInClick = function () {
    isZoomingIn = true
    return zoomClick(this)
  }

  viz.zoomOutClick = function () {
    isZoomingIn = false
    return zoomClick(this)
  }

  const zoomClick = function (_element: any) {
    draw = true
    isZoomClick = true
    const limitsReached = { zoomInLimit: false, zoomOutLimit: false }

    zoomBehavior.scaleBy(baseGroup, isZoomingIn ? 1.3 : 0.7)

    return limitsReached
  }
  // Background click event
  // Check if panning is ongoing
  rect.on('click', () => {
    if (!draw) {
      return viz.trigger('canvasClicked', el)
    }
  })

  baseGroup
    .call(zoomBehavior)
    .on('dblclick.zoom', null as any)
    // Single click is not panning
    .on('click.zoom', () => (draw = false))
    .on('DOMMouseScroll.zoom', handleZoomOnShiftScroll)
    .on('wheel.zoom', handleZoomOnShiftScroll)
    .on('mousewheel.zoom', handleZoomOnShiftScroll)

  const newStatsBucket = function () {
    const bucket: StatsBucket = {
      frameCount: 0,
      geometry: 0,
      layout: { layoutSteps: 0, layoutTime: 0 },
      relationshipRenderers: vizRenderers.relationship
        .map(r => r.name)
        .reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
      duration: () => (bucket.lastFrame ?? 0) - (bucket.firstFrame ?? 0),
      fps: () => ((1000 * bucket.frameCount) / bucket.duration()).toFixed(1),
      lps: () =>
        ((1000 * bucket.layout.layoutSteps) / bucket.duration()).toFixed(1),
      top: function () {
        let time
        const renderers = []
        for (const name in bucket.relationshipRenderers) {
          time = bucket.relationshipRenderers[name]
          renderers.push({
            name,
            time
          })
        }
        renderers.push({
          name: 'forceLayout',
          time: bucket.layout.layoutTime
        })
        renderers.sort((a, b) => b.time - a.time)
        const totalRenderTime = renderers.reduce(
          (prev, current) => prev + current.time,
          0
        )
        return renderers
          .map(
            d => `${d.name}: ${((100 * d.time) / totalRenderTime).toFixed(1)}%`
          )
          .join(', ')
      }
    }
    return bucket
  }

  let currentStats = newStatsBucket()

  const now =
    window.performance && window.performance.now
      ? () => window.performance.now()
      : () => Date.now()

  const render = function () {
    if (!currentStats.firstFrame) {
      currentStats.firstFrame = now()
    }
    currentStats.frameCount++
    const startRender = now()
    geometry.onTick(graph)
    currentStats.geometry += now() - startRender

    const nodeGroups = container
      .selectAll<BaseType, VizNode>('g.node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    for (const renderer of vizRenderers.node) {
      nodeGroups.call(renderer.onTick, viz)
    }

    const relationshipGroups = container
      .selectAll<BaseType, Relationship>('g.relationship')
      .attr(
        'transform',
        d =>
          `translate(${d.source.x} ${d.source.y}) rotate(${
            d.naturalAngle + 180
          })`
      )

    for (const renderer of vizRenderers.relationship) {
      const startRenderer = now()
      relationshipGroups.call(renderer.onTick, viz)
      currentStats.relationshipRenderers[renderer.name] += now() - startRenderer
    }

    return (currentStats.lastFrame = now())
  }

  const force = layout.init(render)

  viz.collectStats = function (): StatsBucket {
    const latestStats = currentStats
    latestStats.layout = force.collectStats()
    currentStats = newStatsBucket()
    return latestStats
  }

  viz.update = function (options: {
    updateNodes: boolean
    updateRelationships: boolean
    precompute?: boolean
  }) {
    if (!graph) {
      return
    }

    geometry.onGraphChange(graph, options)

    const layers = container
      .selectAll('g.layer')
      .data(['relationships', 'nodes'])
    layers
      .enter()
      .append('g')
      .attr('class', d => `layer ${d}`)

    const nodes = graph.nodes()
    const relationships = graph.relationships()

    const relationshipGroups = container
      .select('g.layer.relationships')
      .selectAll<BaseType, Relationship>('g.relationship')
      .data(relationships, d => d.id)

    relationshipGroups
      .enter()
      .append('g')
      .attr('class', 'relationship')
      .on('mousedown', onRelationshipClick)
      .on('mouseover', onRelMouseOver)
      .on('mouseout', onRelMouseOut)

    relationshipGroups.classed(
      'selected',
      relationship => relationship.selected
    )

    for (const renderer of vizRenderers.relationship) {
      relationshipGroups.call(renderer.onGraphChange, viz)
    }

    relationshipGroups.exit().remove()
    const nodeGroups = container
      .select('g.layer.nodes')
      .selectAll<BaseType, VizNode>('g.node')
      .data(nodes, d => d.id)

    function dragHandler(simulation: Simulation<VizNode, Relationship>) {
      function dragstarted(event: D3DragEvent<SVGGElement, VizNode, any>) {
        clearSimulationTimeout()
        if (!event.active) simulation.alphaTarget(0.3).restart()
      }

      function dragged(event: D3DragEvent<SVGGElement, VizNode, any>) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event: D3DragEvent<SVGGElement, VizNode, any>) {
        if (!event.active) simulation.alphaTarget(0)
        setSimulationTimeout(simulation)
      }

      return d3Drag<SVGGElement, VizNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }

    nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(dragHandler(force.simulation))
      .on('mouseover', onNodeMouseOver)
      .on('mouseout', onNodeMouseOut)
      .on('click', onNodeClick)
      .on('dblclick', onNodeDblClick)

    nodeGroups.classed('selected', node => node.selected)

    for (const renderer of vizRenderers.node) {
      nodeGroups.call(renderer.onGraphChange, viz)
    }

    for (const renderer of nodeMenuRenderer) {
      nodeGroups.call(renderer.onGraphChange, viz)
    }

    nodeGroups.exit().remove()

    if (updateViz) {
      force.update(
        graph,
        [layoutDimension, layoutDimension],
        options.precompute
      )

      viz.resize()
      viz.trigger('updated')
    }

    return (updateViz = true)
  }

  viz.resize = function () {
    const size = measureSize()
    return root.attr(
      'viewBox',
      [
        0,
        (layoutDimension - size.height) / 2,
        layoutDimension,
        size.height
      ].join(' ')
    )
  }

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'boundingBox' does not exist on type '{ s... Remove this comment to see the full error message
  viz.boundingBox = () => container.node().getBBox()
  return viz
}

export default vizFn
