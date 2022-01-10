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
import measureText from './textMeasurement'
import distributeCircular from './circumferentialDistribution'
import StraightArrow from './StraightArrow'
import ArcArrow from './ArcArrow'
import GraphStyle from 'browser/modules/D3Visualization/graphStyle'
import Relationship from '../components/Relationship'
import Graph from '../components/Graph'

export type ArrowAngle = {
  floating: Record<string, number>
  fixed: Record<string, number>
}

export default class circumferentialRelationshipRouting {
  style: GraphStyle
  canvas: HTMLCanvasElement
  constructor(style: GraphStyle) {
    this.style = style
    this.canvas = document.createElement('canvas')
  }

  measureRelationshipCaption(
    relationship: Relationship,
    caption: string
  ): number {
    const fontFamily = 'sans-serif'
    const fontSize = parseFloat(
      this.style.forRelationship(relationship).get('font-size')
    )
    const padding = parseFloat(
      this.style.forRelationship(relationship).get('padding')
    )

    const canvas2DContext = this.canvas.getContext('2d')
    return (
      measureText(
        caption,
        fontFamily,
        fontSize,
        <CanvasRenderingContext2D>canvas2DContext
      ) +
      padding * 2
    )
  }

  captionFitsInsideArrowShaftWidth(relationship: Relationship): boolean {
    return (
      parseFloat(this.style.forRelationship(relationship).get('shaft-width')) >
      parseFloat(this.style.forRelationship(relationship).get('font-size'))
    )
  }

  measureRelationshipCaptions(relationships: Relationship[]): void {
    relationships.forEach(relationship => {
      relationship.captionLength = this.measureRelationshipCaption(
        relationship,
        relationship.type
      )

      relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(
        relationship
      )
        ? 'internal'
        : 'external'
    })
  }

  shortenCaption(
    relationship: Relationship,
    caption: string,
    targetWidth: number
  ): [string, number] {
    let shortCaption = caption
    while (true) {
      if (shortCaption.length <= 2) {
        return ['', 0]
      }
      shortCaption = `${shortCaption.substr(0, shortCaption.length - 2)}\u2026`
      const width = this.measureRelationshipCaption(relationship, shortCaption)
      if (width < targetWidth) {
        return [shortCaption, width]
      }
    }
  }

  layoutRelationships(graph: Graph): void {
    let dx, dy
    for (const relationship of graph.relationships()) {
      dx = relationship.target.x - relationship.source.x
      dy = relationship.target.y - relationship.source.y
      relationship.naturalAngle =
        ((Math.atan2(dy, dx) / Math.PI) * 180 + 180) % 360
      delete relationship.arrow
    }

    const sortedNodes = graph
      .nodes()
      .sort((a, b) => b.relationshipCount(graph) - a.relationshipCount(graph))

    for (const node of sortedNodes) {
      let angle
      const relationships: Relationship[] = graph
        .relationships()
        .filter(({ source, target }) => source === node || target === node)

      const arrowAngles: ArrowAngle = { floating: {}, fixed: {} }
      const relationshipMap: Record<string, Relationship> = {}
      for (const relationship of relationships) {
        relationshipMap[relationship.id] = relationship

        if (node === relationship.source) {
          if (
            relationship.hasOwnProperty('arrow') &&
            relationship.arrow &&
            'deflection' in relationship.arrow
          ) {
            arrowAngles.fixed[relationship.id] =
              relationship.naturalAngle + relationship.arrow.deflection
          } else {
            arrowAngles.floating[relationship.id] = relationship.naturalAngle
          }
        }
        if (node === relationship.target) {
          if (
            relationship.hasOwnProperty('arrow') &&
            relationship.arrow &&
            'deflection' in relationship.arrow
          ) {
            arrowAngles.fixed[relationship.id] =
              (relationship.naturalAngle -
                relationship.arrow.deflection +
                180) %
              360
          } else {
            arrowAngles.floating[relationship.id] =
              (relationship.naturalAngle + 180) % 360
          }
        }
      }

      let distributedAngles: Record<string, number> = {}
      for (const id in arrowAngles.floating) {
        angle = arrowAngles.floating[id]
        distributedAngles[id] = angle
      }
      for (const id in arrowAngles.fixed) {
        angle = arrowAngles.fixed[id]
        distributedAngles[id] = angle
      }

      if (relationships.length > 1) {
        distributedAngles = distributeCircular(arrowAngles, 30)
      }

      for (const id in distributedAngles) {
        angle = distributedAngles[id]
        const relationship = relationshipMap[id]
        if (!relationship.hasOwnProperty('arrow')) {
          const deflection: number =
            node === relationship.source
              ? angle - relationship.naturalAngle
              : relationship.naturalAngle - angle + (180 % 360)

          const shaftRadius =
            parseFloat(
              this.style.forRelationship(relationship).get('shaft-width')
            ) / 2 || 2
          const headRadius = shaftRadius + 3
          const headHeight = headRadius * 2

          dx = relationship.target.x - relationship.source.x
          dy = relationship.target.y - relationship.source.y

          const square = (distance: any) => distance * distance
          const centreDistance = Math.sqrt(square(dx) + square(dy))

          // @ts-expect-error this math is wrong need to understand what deflections is to fix
          if (Math.abs(deflection < Math.PI / 180)) {
            relationship.arrow = new StraightArrow(
              relationship.source.radius,
              relationship.target.radius,
              centreDistance,
              shaftRadius,
              headRadius,
              headHeight,
              relationship.captionLayout
            )
          } else {
            relationship.arrow = new ArcArrow(
              relationship.source.radius,
              relationship.target.radius,
              centreDistance,
              deflection,
              shaftRadius * 2,
              headRadius * 2,
              headHeight,
              relationship.captionLayout
            )
          }

          if (relationship.captionSettingsArray) {
            relationship.captionSettingsArray.forEach((label: any) => {
              label.captionLength = this.measureRelationshipCaption(
                relationship,
                label.caption
              )
              const temp: [string, number] =
                relationship.arrow.shaftLength > label.captionLength
                  ? [label.caption, label.captionLength]
                  : this.shortenCaption(
                      relationship,
                      label.caption,
                      relationship.arrow.shaftLength
                    )
              label.shortCaption = temp[0]
              label.shortCaptionLength = temp[1]
            })
          }
          if (relationship.sideCaptions) {
            Object.keys(relationship.sideCaptions).forEach(position => {
              const array = relationship.sideCaptions[position]
              array.forEach((label: any) => {
                label.captionLength = this.measureRelationshipCaption(
                  relationship,
                  label.caption
                )
                const allowedLength = relationship.arrow.shaftLength / 2
                const temp: [string, number] =
                  allowedLength > label.captionLength
                    ? [label.caption, label.captionLength]
                    : this.shortenCaption(
                        relationship,
                        label.caption,
                        allowedLength
                      )
                label.shortCaption = temp[0]
                label.shortCaptionLength = temp[1]
              })
            })
          }
          if (relationship.arrow.shaftLength > relationship.captionLength) {
            relationship.shortCaption = relationship.caption
            relationship.shortCaptionLength = relationship.captionLength
          } else {
            const [shortCaption, length] = this.shortenCaption(
              relationship,
              relationship.caption,
              relationship.arrow.shaftLength
            )
            relationship.shortCaption = shortCaption
            relationship.shortCaptionLength = length
          }
        }
      }
    }
  }
}
