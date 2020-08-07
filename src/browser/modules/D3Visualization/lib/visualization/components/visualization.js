/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import d3 from 'd3'
import NeoD3Geometry from './graphGeometry'
import * as vizRenderers from '../renders/init'
import { menu as menuRenderer } from '../renders/menu'
import vizClickHandler from '../utils/clickHandler'

const vizFn = function(el, measureSize, graph, layout, style) {
  const viz = { style }

  const root = d3.select(el)
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
  const geometry = new NeoD3Geometry(style)

  // This flags that a panning is ongoing and won't trigger
  // 'canvasClick' event when panning ends.
  let draw = false

  // Arbitrary dimension used to keep force layout aligned with
  // the centre of the svg view-port.
  const layoutDimension = 200

  let updateViz = true

  // To be overridden
  viz.trigger = function(event, ...args) {}

  const onNodeClick = node => {
    updateViz = false
    return viz.trigger('nodeClicked', node)
  }

  const onNodeDblClick = node => viz.trigger('nodeDblClicked', node)

  const onNodeDragToggle = node => viz.trigger('nodeDragToggle', node)

  const onRelationshipClick = relationship => {
    d3.event.stopPropagation()
    updateViz = false
    return viz.trigger('relationshipClicked', relationship)
  }

  const onNodeMouseOver = node => viz.trigger('nodeMouseOver', node)
  const onNodeMouseOut = node => viz.trigger('nodeMouseOut', node)

  const onRelMouseOver = rel => viz.trigger('relMouseOver', rel)
  const onRelMouseOut = rel => viz.trigger('relMouseOut', rel)

  let zoomLevel = null

  const zoomed = function() {
    draw = true
    return container.attr(
      'transform',
      `translate(${zoomBehavior.translate()})scale(${zoomBehavior.scale()})`
    )
  }

  const zoomBehavior = d3.behavior
    .zoom()
    .scaleExtent([0.2, 1])
    .on('zoom', zoomed)

  const interpolateZoom = (translate, scale) =>
    d3
      .transition()
      .duration(500)
      .tween('zoom', () => {
        const t = d3.interpolate(zoomBehavior.translate(), translate)
        const s = d3.interpolate(zoomBehavior.scale(), scale)
        return function(a) {
          zoomBehavior.scale(s(a)).translate(t(a))
          return zoomed()
        }
      })

  let isZoomingIn = true

  viz.zoomInClick = function() {
    isZoomingIn = true
    return zoomClick(this)
  }

  viz.zoomOutClick = function() {
    isZoomingIn = false
    return zoomClick(this)
  }

  const zoomClick = function(element) {
    draw = true
    const limitsReached = { zoomInLimit: false, zoomOutLimit: false }

    if (isZoomingIn) {
      zoomLevel = Number((zoomBehavior.scale() * (1 + 0.2 * 1)).toFixed(2))
      if (zoomLevel >= zoomBehavior.scaleExtent()[1]) {
        limitsReached.zoomInLimit = true
        interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[1])
      } else {
        interpolateZoom(zoomBehavior.translate(), zoomLevel)
      }
    } else {
      zoomLevel = Number((zoomBehavior.scale() * (1 + 0.2 * -1)).toFixed(2))
      if (zoomLevel <= zoomBehavior.scaleExtent()[0]) {
        limitsReached.zoomOutLimit = true
        interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[0])
      } else {
        interpolateZoom(zoomBehavior.translate(), zoomLevel)
      }
    }
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
    .on('dblclick.zoom', null)
    // Single click is not panning
    .on('click.zoom', () => (draw = false))
    .on('DOMMouseScroll.zoom', null)
    .on('wheel.zoom', null)
    .on('mousewheel.zoom', null)

  const newStatsBucket = function() {
    const bucket = {
      frameCount: 0,
      geometry: 0,
      relationshipRenderers: (function() {
        const timings = {}
        vizRenderers.relationship.forEach(r => (timings[r.name] = 0))
        return timings
      })()
    }
    bucket.duration = () => bucket.lastFrame - bucket.firstFrame
    bucket.fps = () =>
      ((1000 * bucket.frameCount) / bucket.duration()).toFixed(1)
    bucket.lps = () =>
      ((1000 * bucket.layout.layoutSteps) / bucket.duration()).toFixed(1)
    bucket.top = function() {
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
    return bucket
  }

  let currentStats = newStatsBucket()

  const now =
    window.performance && window.performance.now
      ? () => window.performance.now()
      : () => Date.now()

  const render = function() {
    if (!currentStats.firstFrame) {
      currentStats.firstFrame = now()
    }
    currentStats.frameCount++
    const startRender = now()
    geometry.onTick(graph)
    currentStats.geometry += now() - startRender

    const nodeGroups = container
      .selectAll('g.node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    for (var renderer of Array.from(vizRenderers.node)) {
      nodeGroups.call(renderer.onTick, viz)
    }

    const relationshipGroups = container
      .selectAll('g.relationship')
      .attr(
        'transform',
        d =>
          `translate(${d.source.x} ${d.source.y}) rotate(${d.naturalAngle +
            180})`
      )

    for (renderer of Array.from(vizRenderers.relationship)) {
      const startRenderer = now()
      relationshipGroups.call(renderer.onTick, viz)
      currentStats.relationshipRenderers[renderer.name] += now() - startRenderer
    }

    return (currentStats.lastFrame = now())
  }

  const force = layout.init(render)

  // Add custom drag event listeners
  force
    .drag()
    .on('dragstart.node', d => onNodeDragToggle(d))
    .on('dragend.node', () => onNodeDragToggle())

  viz.collectStats = function() {
    const latestStats = currentStats
    latestStats.layout = force.collectStats()
    currentStats = newStatsBucket()
    return latestStats
  }

  viz.update = function() {
    if (!graph) {
      return
    }

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
      .selectAll('g.relationship')
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

    geometry.onGraphChange(graph)

    for (var renderer of Array.from(vizRenderers.relationship)) {
      relationshipGroups.call(renderer.onGraphChange, viz)
    }

    relationshipGroups.exit().remove()

    const nodeGroups = container
      .select('g.layer.nodes')
      .selectAll('g.node')
      .data(nodes, d => d.id)

    nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(force.drag)
      .call(clickHandler)
      .on('mouseover', onNodeMouseOver)
      .on('mouseout', onNodeMouseOut)

    nodeGroups.classed('selected', node => node.selected)

    for (renderer of Array.from(vizRenderers.node)) {
      nodeGroups.call(renderer.onGraphChange, viz)
    }

    for (renderer of Array.from(menuRenderer)) {
      nodeGroups.call(renderer.onGraphChange, viz)
    }

    nodeGroups.exit().remove()

    if (updateViz) {
      force.update(graph, [layoutDimension, layoutDimension])

      viz.resize()
      viz.trigger('updated')
    }

    return (updateViz = true)
  }

  viz.resize = function() {
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

  viz.boundingBox = () => container.node().getBBox()

  const clickHandler = vizClickHandler()
  clickHandler.on('click', onNodeClick)
  clickHandler.on('dblclick', onNodeDblClick)

  return viz
}

export default vizFn
