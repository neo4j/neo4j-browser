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
import Node, { NodeCaptionLine } from '../components/Node2'
import Renderer from '../components/renderer2'
const noop = () => undefined

const nodeRingStrokeSize = 8

const nodeOutline = new Renderer({
  onGraphChange(selection, viz) {
    const circles = selection
      .selectAll('circle.outline')
      .data((node: Node) => [node])

    circles
      .enter()
      .append('circle')
      .classed('outline', true)
      .attr({
        cx: 0,
        cy: 0
      })

    circles.attr({
      r(node: Node) {
        return node.radius
      },
      fill(node: Node) {
        return viz.style.forNode(node).get('color')
      },
      stroke(node: Node) {
        return viz.style.forNode(node).get('border-color')
      },
      'stroke-width'(node: Node) {
        return viz.style.forNode(node).get('border-width')
      }
    })

    return circles.exit().remove()
  },
  onTick: noop
})

const nodeCaption = new Renderer({
  onGraphChange(selection, viz) {
    const text = selection
      .selectAll('text.caption')
      .data((node: Node) => node.caption)

    text
      .enter()
      .append('text')
      // Classed element ensures duplicated data will be removed before adding
      .classed('caption', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    text
      .text((line: NodeCaptionLine) => line.text)
      .attr('x', 0)
      .attr('y', (line: NodeCaptionLine) => line.baseline)
      .attr('font-size', (line: NodeCaptionLine) =>
        viz.style.forNode(line.node).get('font-size')
      )
      .attr({
        fill(line: NodeCaptionLine) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeRing = new Renderer({
  onGraphChange(selection) {
    const circles = selection
      .selectAll('circle.ring')
      .data((node: Node) => [node])
    circles
      .enter()
      .insert('circle', '.outline')
      .classed('ring', true)
      .attr({
        cx: 0,
        cy: 0,
        'stroke-width': `${nodeRingStrokeSize}px`
      })

    circles.attr({
      r(node: Node) {
        return node.radius + 4
      }
    })

    return circles.exit().remove()
  },

  onTick: noop
})

const arrowPath = new Renderer({
  name: 'arrowPath',
  onGraphChange(selection, viz) {
    const paths = selection.selectAll('path.outline').data((rel: any) => [rel])

    paths
      .enter()
      .append('path')
      .classed('outline', true)

    paths
      .attr('fill', (rel: any) => viz.style.forRelationship(rel).get('color'))
      .attr('stroke', 'none')

    return paths.exit().remove()
  },

  onTick(selection) {
    return selection
      .selectAll('path')
      .attr('d', d => d.arrow.outline(d.shortCaptionLength))
  }
})

const relationshipType = new Renderer({
  name: 'relationshipType',
  onGraphChange(selection, viz) {
    const texts = selection.selectAll('text').data(rel => [rel])

    texts
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    texts
      .attr('font-size', rel => viz.style.forRelationship(rel).get('font-size'))
      .attr('fill', rel =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )

    return texts.exit().remove()
  },

  onTick(selection, viz) {
    return (
      selection
        .selectAll('text')
        .attr('x', rel => rel.arrow.midShaftPoint.x)
        .attr(
          'y',
          rel =>
            rel.arrow.midShaftPoint.y +
            parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
            1
        )
        //@ts-expect-error
        .attr('transform', (rel: any) => {
          if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
            return `rotate(180 ${rel.arrow.midShaftPoint.x} ${rel.arrow.midShaftPoint.y})`
          } else {
            return null
          }
        })
        .text(rel => rel.shortCaption)
    )
  }
})

const relationshipOverlay = new Renderer({
  name: 'relationshipOverlay',
  onGraphChange(selection) {
    const rects = selection.selectAll('path.overlay').data(rel => [rel])

    rects
      .enter()
      .append('path')
      .classed('overlay', true)

    return rects.exit().remove()
  },

  onTick(selection) {
    const band = 16

    return selection
      .selectAll('path.overlay')
      .attr('d', d => d.arrow.overlay(band))
  }
})

const node = [nodeOutline, nodeCaption, nodeRing]

const relationship = [arrowPath, relationshipType, relationshipOverlay]

export { node, relationship }
