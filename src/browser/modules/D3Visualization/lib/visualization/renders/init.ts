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
import { BaseType } from 'd3-selection'

import Relationship from '../components/Relationship'
import Renderer from '../components/Renderer'
import VizNode, { NodeCaptionLine } from '../components/VizNode'

const noop = () => undefined

const nodeRingStrokeSize = 8

const nodeOutline = new Renderer<VizNode>({
  name: 'nodeOutline',
  onGraphChange(selection, viz) {
    return selection
      .selectAll('circle.outline')
      .data(node => [node])
      .join('circle')
      .classed('outline', true)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', (node: VizNode) => {
        return node.radius
      })
      .attr('fill', (node: VizNode) => {
        return viz.style.forNode(node).get('color')
      })
      .attr('stroke', (node: VizNode) => {
        return viz.style.forNode(node).get('border-color')
      })
      .attr('stroke-width', (node: VizNode) => {
        return viz.style.forNode(node).get('border-width')
      })
  },
  onTick: noop
})

const nodeCaption = new Renderer<VizNode>({
  name: 'nodeCaption',
  onGraphChange(selection, viz) {
    return (
      selection
        .selectAll('text.caption')
        .data((node: VizNode) => node.caption)
        .join('text')
        // Classed element ensures duplicated data will be removed before adding
        .classed('caption', true)
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .attr('x', 0)
        .attr('y', (line: NodeCaptionLine) => line.baseline)
        .attr('font-size', (line: NodeCaptionLine) =>
          viz.style.forNode(line.node).get('font-size')
        )
        .attr('fill', (line: NodeCaptionLine) =>
          viz.style.forNode(line.node).get('text-color-internal')
        )
        .text((line: NodeCaptionLine) => line.text)
    )
  },

  onTick: noop
})

const nodeRing = new Renderer<VizNode>({
  name: 'nodeRing',
  onGraphChange(selection) {
    const circles = selection
      .selectAll('circle.ring')
      .data((node: VizNode) => [node])

    circles
      .enter()
      .insert('circle', '.outline')
      .classed('ring', true)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('stroke-width', `${nodeRingStrokeSize}px`)
      .attr('r', (node: VizNode) => node.radius + 4)

    return circles.exit().remove()
  },

  onTick: noop
})

const arrowPath = new Renderer<Relationship>({
  name: 'arrowPath',

  onGraphChange(selection, viz) {
    return selection
      .selectAll('path.outline')
      .data((rel: any) => [rel])
      .join('path')
      .classed('outline', true)
      .attr('fill', (rel: any) => viz.style.forRelationship(rel).get('color'))
      .attr('stroke', 'none')
  },

  onTick(selection) {
    return selection
      .selectAll<BaseType, Relationship>('path')
      .attr('d', d => d.arrow!.outline(d.shortCaptionLength ?? 0))
  }
})

const relationshipType = new Renderer<Relationship>({
  name: 'relationshipType',
  onGraphChange(selection, viz) {
    return selection
      .selectAll('text')
      .data(rel => [rel])
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('font-size', rel => viz.style.forRelationship(rel).get('font-size'))
      .attr('fill', rel =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )
  },

  onTick(selection, viz) {
    return selection
      .selectAll<BaseType, Relationship>('text')
      .attr('x', rel => rel?.arrow?.midShaftPoint?.x ?? 0)
      .attr(
        'y',
        rel =>
          (rel?.arrow?.midShaftPoint?.y ?? 0) +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', rel => {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${rel?.arrow?.midShaftPoint?.x ?? 0} ${
            rel?.arrow?.midShaftPoint?.y ?? 0
          })`
        } else {
          return null
        }
      })
      .text(rel => rel.shortCaption ?? '')
  }
})

const relationshipOverlay = new Renderer<Relationship>({
  name: 'relationshipOverlay',
  onGraphChange(selection) {
    return selection
      .selectAll('path.overlay')
      .data(rel => [rel])
      .join('path')
      .classed('overlay', true)
  },

  onTick(selection) {
    const band = 16

    return selection
      .selectAll<BaseType, Relationship>('path.overlay')
      .attr('d', d => d.arrow!.overlay(band))
  }
})

const node = [nodeOutline, nodeCaption, nodeRing]

const relationship = [arrowPath, relationshipType, relationshipOverlay]

export { node, relationship }
