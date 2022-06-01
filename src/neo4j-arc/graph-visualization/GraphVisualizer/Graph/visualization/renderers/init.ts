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
import { BaseType, select } from 'd3-selection'

import { NodeCaptionLine, NodeModel } from '../../../../models/Node'
import { RelationshipModel } from '../../../../models/Relationship'
import Renderer from '../Renderer'
import { max } from 'lodash-es'
import { IStyleForLabelProps } from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/GrassEditor'
import { IColorSettings } from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/color/SetupColorStorage'
import { RelArrowCaptionPosition } from 'project-root/src/browser/modules/Stream/CypherFrame/VisualizationView/PropertiesPanelContent/modal/label/SetupLabelRelArrowSVG'
import { TSpanElement } from 'canvg'

const noop = () => undefined

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

function getColorStyleForItem({
  item,
  currentStyle,
  key
}: {
  item: {
    propertyMap: {
      [key: string]: string
    }
  }
  currentStyle: any
  key: keyof IStyleForLabelProps
}): string {
  const colorSettings: IColorSettings | '' = currentStyle.get('colorSettings')
  if (colorSettings !== '' && item.propertyMap[colorSettings.key]) {
    return (
      colorSettings?.settings?.[item.propertyMap[colorSettings.key]]?.[key] ??
      currentStyle.get(key)
    )
  } else {
    return currentStyle.get(key)
  }
}

const nodeOutline = new Renderer<NodeModel>({
  name: 'nodeOutline',
  onGraphChange(selection, viz) {
    return selection
      .selectAll('circle.b-outline')
      .data(node => [node])
      .join('circle')
      .classed('b-outline', true)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', (node: NodeModel) => {
        return node.radius
      })
      .attr('fill', (node: NodeModel) => {
        return getColorStyleForItem({
          currentStyle: viz.style.forNode(node),
          item: node,
          key: 'color'
        })
      })
      .attr('stroke', (node: NodeModel) => {
        return getColorStyleForItem({
          currentStyle: viz.style.forNode(node),
          item: node,
          key: 'border-color'
        })
      })
      .attr('stroke-width', (node: NodeModel) => {
        return viz.style.forNode(node).get('border-width')
      })
  },
  onTick: noop
})

const nodeCaption = new Renderer<NodeModel>({
  name: 'nodeCaption',
  onGraphChange(selection, viz) {
    return (
      selection
        .selectAll('text.caption')
        .data((node: NodeModel) => node.caption)
        .join('text')
        // Classed element ensures duplicated data will be removed before adding
        .classed('caption', true)
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .attr('x', 0)
        .attr('y', (line: NodeCaptionLine) => line.baseline)
        .style(
          'font-weight',
          (line: NodeCaptionLine) => line.fontWeight ?? 'inherit'
        )
        .style(
          'text-decoration',
          (line: NodeCaptionLine) => line.textDecoration ?? 'inherit'
        )
        .style(
          'font-style',
          (line: NodeCaptionLine) => line.fontStyle ?? 'inherit'
        )
        .attr('font-size', (line: NodeCaptionLine) =>
          viz.style.forNode(line.node).get('font-size')
        )
        .attr('fill', (line: NodeCaptionLine) =>
          getColorStyleForItem({
            currentStyle: viz.style.forNode(line.node),
            item: line.node,
            key: 'text-color-internal'
          })
        )
        .text((line: NodeCaptionLine) => line.text)
    )
  },

  onTick: noop
})

const nodeRing = new Renderer<NodeModel>({
  name: 'nodeRing',
  onGraphChange(selection) {
    const circles = selection
      .selectAll('circle.ring')
      .data((node: NodeModel) => [node])

    circles
      .enter()
      .insert('circle', '.b-outline')
      .classed('ring', true)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('stroke-width', `${nodeRingStrokeSize}px`)
      .attr('r', (node: NodeModel) => node.radius + 4)

    return circles.exit().remove()
  },

  onTick: noop
})

const arrowPath = new Renderer<RelationshipModel>({
  name: 'arrowPath',

  onGraphChange(selection, viz) {
    return selection
      .selectAll('path.b-outline')
      .data((rel: any) => [rel])
      .join('path')
      .classed('b-outline', true)
      .attr('fill', (rel: any) =>
        getColorStyleForItem({
          currentStyle: viz.style.forRelationship(rel),
          item: rel,
          key: 'color'
        })
      )
      .attr('stroke', 'none')
  },

  onTick(selection) {
    return selection
      .selectAll<BaseType, RelationshipModel>('path')
      .attr('d', d => {
        if (d.captionSettingsArray != undefined) {
          return d.arrow.outline(
            max(d.captionSettingsArray.map(t => t.shortCaptionLength)) ??
              d.shortCaptionLength
          )
        } else {
          return d.arrow.outline(d.shortCaptionLength!)
        }
      })
  }
})

const relationshipType = new Renderer<RelationshipModel>({
  name: 'relationshipType',
  onGraphChange(selection, viz) {
    const textContainers = selection
      .selectAll<SVGTextElement, RelationshipModel>('.textContainer')
      .data(rel => [rel])
    const newContainers = textContainers
      .enter()
      .append('g')
      .classed('textContainer', true)

    newContainers
      .append('text')
      .classed('centerText', true)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')

    const centerTexts = selection.selectAll<SVGTextElement, RelationshipModel>(
      '.centerText'
    )

    centerTexts
      .attr('font-size', (rel: any) =>
        viz.style.forRelationship(rel).get('font-size')
      )
      .attr('fill', (rel: any) =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )

    centerTexts
      .filter(rel => rel.captionSettingsArray != undefined)
      .each(function (this: SVGTextElement, rel) {
        if (this.children.length === 0) {
          select(this).text('')
        }

        const tspans = select(this)
          .selectAll('tspan')
          .data(rel.captionSettingsArray)

        tspans
          .enter()
          .append('tspan')
          .attr('text-anchor', 'middle')
          .attr('pointer-events', 'none')

        return tspans.exit().remove()
      })

    textContainers.each(function (this: SVGTextElement, rel) {
      const $this = select(this)
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
          .attr('pointer-events', 'none')
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

  onTick(selection, viz) {
    selection
      .selectAll<SVGGElement, RelationshipModel>('.textContainer')
      .each(function (this: SVGGElement, rel) {
        const container = select(this)
        container
          .selectAll<SVGTextElement, any>('.allSideTexts')
          .attr('text-anchor', d => {
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
          })
          .attr('x', d => {
            const x1 = rel.source.radius
            const x2 = rel.source.radius + rel.arrow.shaftLength - 10 // TODO DM; 'length' property replaced
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
          .attr('y', (d: any) => {
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
          .text((d: any) => d.shortCaption)
      })

    return selection
      .selectAll<SVGTextElement, RelationshipModel>('.centerText')
      .attr('x', rel => rel.arrow.midShaftPoint.x)
      .attr(
        'y',
        rel =>
          rel.arrow.midShaftPoint.y +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', rel => {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${rel.arrow.midShaftPoint.x} ${rel.arrow.midShaftPoint.y})`
        } else {
          return ''
        }
      })
      .each(function (this: SVGTextElement, rel) {
        const $this = select(this)

        if (rel.captionSettingsArray != undefined) {
          $this
            .selectAll<SVGTSpanElement, any>('tspan')
            .attr('x', rel.arrow.midShaftPoint.x)
            .attr(
              'y',
              d =>
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
            .style('font-weight', d => d['font-weight'])
            .style('font-style', d => d['font-style'])
            .style('text-decoration', d => d['text-decoration'])
            .text(d => d.shortCaption ?? '')
        } else {
          $this.text(rel.shortCaption ?? '')
        }
      })
  }
})

const relationshipOverlay = new Renderer<RelationshipModel>({
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
      .selectAll<BaseType, RelationshipModel>('path.overlay')
      .attr('d', d => d.arrow!.overlay(band))
  }
})

const node = [nodeOutline, nodeCaption, nodeRing]

const relationship = [arrowPath, relationshipType, relationshipOverlay]

export { node, relationship }
