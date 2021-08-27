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
import Renderer from '../components/renderer'
import * as d3 from 'd3'
import { max } from 'lodash-es'
import { RelArrowCaptionPosition } from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelRelArrowSVG'

const noop = function() {}

const nodeRingStrokeSize = 8
const sideTextsPositions: (
  | RelArrowCaptionPosition.startAbove
  | RelArrowCaptionPosition.startBelow
  | RelArrowCaptionPosition.endAbove
  | RelArrowCaptionPosition.endBelow
)[] = [
  RelArrowCaptionPosition.startAbove,
  RelArrowCaptionPosition.startBelow,
  RelArrowCaptionPosition.endAbove,
  RelArrowCaptionPosition.endBelow
]
const nodeOutline = new Renderer({
  onGraphChange(selection: any, viz: any) {
    const circles = selection
      .selectAll('circle.outline')
      .data((node: any) => [node])

    circles
      .enter()
      .append('circle')
      .classed('outline', true)
      .attr({
        cx: 0,
        cy: 0
      })

    circles.attr({
      r(node: any) {
        return node.radius
      },
      fill(node: any) {
        return viz.style.forNode(node).get('color')
      },
      stroke(node: any) {
        return viz.style.forNode(node).get('border-color')
      },
      'stroke-width'(node: any) {
        return viz.style.forNode(node).get('border-width')
      }
    })

    return circles.exit().remove()
  },
  onTick: noop
})

const nodeCaption = new Renderer({
  onGraphChange(selection: any, viz: any) {
    const text = selection
      .selectAll('text.caption')
      .data((node: any) => node.caption)

    text
      .enter()
      .append('text')
      // .classed('caption', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    text
      .text((line: any) => line.text)
      .style('font-weight', (line: any) => line.fontWeight ?? 'inherit')
      .style('text-decoration', (line: any) => line.textDecoration ?? 'inherit')
      .style('font-style', (line: any) => line.fontStyle ?? 'inherit')
      .attr('x', 0)
      .attr('y', (line: any) => line.baseline)
      .attr('font-size', (line: any) =>
        viz.style.forNode(line.node).get('font-size')
      )
      .attr({
        fill(line: any) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeIcon = new Renderer({
  onGraphChange(selection: any, viz: any) {
    const text = selection.selectAll('text').data((node: any) => node.caption)

    text
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })
      .attr({ 'font-family': 'streamline' })

    text
      .text((line: any) => viz.style.forNode(line.node).get('icon-code'))
      .attr('dy', (line: any) => line.node.radius / 16)
      .attr('font-size', (line: any) => line.node.radius)
      .attr({
        fill(line: any) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeRing = new Renderer({
  onGraphChange(selection: any) {
    const circles = selection
      .selectAll('circle.ring')
      .data((node: any) => [node])
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
      r(node: any) {
        return node.radius + 4
      }
    })

    return circles.exit().remove()
  },

  onTick: noop
})

const arrowPath = new Renderer({
  name: 'arrowPath',
  onGraphChange(selection: any, viz: any) {
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

  onTick(selection: any) {
    return selection.selectAll('path').attr(
      'd',
      (d: {
        arrow: {
          outline: (d: number) => void
        }
        shortCaptionLength: number
        captionSettingsArray: Array<{ shortCaptionLength: number }>
      }) => {
        if (d.captionSettingsArray != undefined) {
          return d.arrow.outline(
            max(d.captionSettingsArray.map(t => t.shortCaptionLength)) ??
              d.shortCaptionLength
          )
        } else {
          return d.arrow.outline(d.shortCaptionLength)
        }
      }
    )
  }
})

const relationshipType = new Renderer({
  name: 'relationshipType',
  onGraphChange(selection: d3.Selection<any>, viz: any) {
    const textContainers = selection
      .selectAll('.textContainer')
      .data((rel: any) => [rel])
    const newContainers = textContainers
      .enter()
      .append('g')
      .classed('textContainer', true)

    newContainers
      .append('text')
      .classed('centerText', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    const centerTexts = selection.selectAll('.centerText')

    centerTexts
      .attr('font-size', (rel: any) =>
        viz.style.forRelationship(rel).get('font-size')
      )
      .attr('fill', (rel: any) =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )

    centerTexts
      .filter((rel: any) => rel.captionSettingsArray != undefined)
      .each(function(this: SVGTextElement, rel: any) {
        if (this.children.length === 0) {
          d3.select(this).text('')
        }

        const tspans = d3
          .select(this)
          .selectAll('tspan')
          .data(rel.captionSettingsArray)

        tspans
          .enter()
          .append('tspan')
          .attr({ 'text-anchor': 'middle' })
          .attr({ 'pointer-events': 'none' })

        return tspans.exit().remove()
      })

    textContainers.each(function(this: SVGTextElement, rel: any) {
      const $this = d3.select(this)
      sideTextsPositions.forEach(position => {
        const className = 'sideText' + position
        const sideTexts = $this
          .selectAll('.' + className)
          .data(rel.sideCaptions?.[position] ?? [])
        sideTexts
          .enter()
          .append('text')
          .classed(className, true)
          .classed('allSideTexts', true)
          .attr({ 'pointer-events': 'none' })
          .attr('font-size', () =>
            viz.style.forRelationship(rel).get('font-size')
          )
          .attr('fill', () =>
            viz.style
              .forRelationship(rel)
              .get(`text-color-${rel.captionLayout}`)
          )
        return sideTexts.exit().remove()
      })
    })
    return textContainers.exit().remove()
  },

  onTick(selection: any, viz: any) {
    selection
      .selectAll('.textContainer')
      .each(function(this: SVGGElement, rel: any) {
        const container = d3.select(this)
        container
          .selectAll('.allSideTexts')
          .attr({
            'text-anchor': (d: any) => {
              if (
                [
                  RelArrowCaptionPosition.startBelow,
                  RelArrowCaptionPosition.startAbove
                ].includes(d.position)
              ) {
                if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
                  return 'end'
                } else {
                  return 'start'
                }
              } else {
                if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
                  return 'start'
                } else {
                  return 'end'
                }
              }
            }
          })
          .attr('x', d => {
            const x1 = rel.source.radius
            const x2 = rel.source.radius + rel.arrow.length - 10
            if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
              return [
                RelArrowCaptionPosition.startBelow,
                RelArrowCaptionPosition.startAbove
              ].includes(d.position)
                ? x2
                : x1
            } else {
              return [
                RelArrowCaptionPosition.startBelow,
                RelArrowCaptionPosition.startAbove
              ].includes(d.position)
                ? x1
                : x2
            }
          })
          .attr('y', d => {
            return (
              ([
                RelArrowCaptionPosition.startBelow,
                RelArrowCaptionPosition.endBelow
              ].includes(d.position)
                ? 10
                : -5) + d.yOffset
            )
          })
          .attr('transform', () => {
            if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
              return `rotate(180 ${rel.arrow.midShaftPoint.x} ${rel.arrow.midShaftPoint.y})`
            } else {
              return ''
            }
          })
          .style('font-weight', (d: any) => d['font-weight'])
          .style('font-style', (d: any) => d['font-style'])
          .style('text-decoration', (d: any) => d['text-decoration'])
          .text(d => d.caption)
      })

    return selection
      .selectAll('.centerText')
      .attr('x', (rel: any) => rel.arrow.midShaftPoint.x)
      .attr(
        'y',
        (rel: any) =>
          rel.arrow.midShaftPoint.y +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', (rel: any) => {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${rel.arrow.midShaftPoint.x} ${rel.arrow.midShaftPoint.y})`
        } else {
          return ''
        }
      })
      .each(function(this: SVGTextElement, rel: any) {
        const $this = d3.select(this)

        if (rel.captionSettingsArray != undefined) {
          $this
            .selectAll('tspan')
            .attr('x', rel.arrow.midShaftPoint.x)
            .attr(
              'y',
              (d: any) =>
                rel.arrow.midShaftPoint.y +
                parseFloat(viz.style.forRelationship(rel).get('font-size')) /
                  2 -
                1 +
                d.yOffset
            )
            .attr('transform', () => {
              if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
                return `rotate(180 ${rel.arrow.midShaftPoint.x} ${rel.arrow.midShaftPoint.y})`
              } else {
                return ''
              }
            })
            .style('font-weight', (d: any) => d['font-weight'])
            .style('font-style', (d: any) => d['font-style'])
            .style('text-decoration', (d: any) => d['text-decoration'])
            .text((d: any) => d.shortCaption)
        } else {
          $this.text(rel.shortCaption)
        }
      })
  }
})

const relationshipOverlay = new Renderer({
  name: 'relationshipOverlay',
  onGraphChange(selection: any) {
    const rects = selection.selectAll('path.overlay').data((rel: any) => [rel])

    rects
      .enter()
      .append('path')
      .classed('overlay', true)

    return rects.exit().remove()
  },

  onTick(selection: any) {
    const band = 16

    return selection
      .selectAll('path.overlay')
      .attr('d', (d: any) => d.arrow.overlay(band))
  }
})

const node = []
node.push(nodeOutline)
node.push(nodeIcon)
node.push(nodeCaption)
node.push(nodeRing)

const relationship = []
relationship.push(arrowPath)
relationship.push(relationshipType)
relationship.push(relationshipOverlay)

export { node, relationship }
