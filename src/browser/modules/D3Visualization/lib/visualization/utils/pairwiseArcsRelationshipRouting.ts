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
import LoopArrow from './LoopArrow'
import StraightArrow from './StraightArrow'
import ArcArrow from './ArcArrow'
import GraphStyle from 'browser/modules/D3Visualization/graphStyle'
import Relationship from '../components/Relationship'
import Graph from '../components/Graph'
import { NodePair } from '../components/Graph'

export default class PairwiseArcsRelationshipRouting {
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
    const padding = parseFloat(
      this.style.forRelationship(relationship).get('padding')
    )
    const canvas2DContext = this.canvas.getContext('2d')
    return (
      measureText(
        caption,
        fontFamily,
        // TODO BROKEN
        // @ts-expect-error
        relationship.captionHeight,
        <CanvasRenderingContext2D>canvas2DContext
      ) +
      padding * 2
    )
  }

  captionFitsInsideArrowShaftWidth(relationship: Relationship): boolean {
    return (
      parseFloat(this.style.forRelationship(relationship).get('shaft-width')) >
      // TODO BROKEN
      // @ts-expect-error
      relationship.captionHeight
    )
  }

  measureRelationshipCaptions(relationships: Relationship[]): void {
    relationships.forEach(relationship => {
      relationship.captionHeight = parseFloat(
        this.style.forRelationship(relationship).get('font-size')
      )
      relationship.captionLength = this.measureRelationshipCaption(
        relationship,
        // TODO BROKEN
        // @ts-expect-error
        relationship.caption
      )

      relationship.captionLayout =
        this.captionFitsInsideArrowShaftWidth(relationship) &&
        !relationship.isLoop()
          ? 'internal'
          : 'external'
    })
  }

  shortenCaption(
    relationship: Relationship,
    caption: string,
    targetWidth: number
  ): [string, number] {
    let shortCaption = caption || 'caption'
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

  computeGeometryForNonLoopArrows(nodePairs: NodePair[]): void {
    const square = (distance: number) => distance * distance

    nodePairs.forEach(nodePair => {
      if (!nodePair.isLoop()) {
        // TODO type error
        // @ts-expect-error
        const dx = nodePair.nodeA.x - nodePair.nodeB.x
        // @ts-expect-error
        const dy = nodePair.nodeA.y - nodePair.nodeB.y
        const angle = ((Math.atan2(dy, dx) / Math.PI) * 180 + 360) % 360
        const centreDistance = Math.sqrt(square(dx) + square(dy))

        nodePair.relationships.forEach(relationship => {
          relationship.naturalAngle =
            relationship.target === nodePair.nodeA ? (angle + 180) % 360 : angle
          relationship.centreDistance = centreDistance
        })
      }
    })
  }

  distributeAnglesForLoopArrows(
    nodePairs: NodePair[],
    relationships: Relationship[]
  ): void {
    for (const nodePair of nodePairs) {
      if (nodePair.isLoop()) {
        let angles = []
        const node = nodePair.nodeA
        for (const relationship of Array.from(relationships)) {
          if (!relationship.isLoop()) {
            if (relationship.source === node) {
              angles.push(relationship.naturalAngle)
            }
            if (relationship.target === node) {
              //TODO
              // @ts-expect-error
              angles.push(relationship.naturalAngle + 180)
            }
          }
        }
        // @ts-expect-error
        angles = angles.map(a => (a + 360) % 360).sort((a, b) => a - b)

        if (angles.length > 0) {
          let end, start
          const biggestGap = {
            start: 0,
            end: 0
          }

          for (let i = 0; i < angles.length; i++) {
            const angle = angles[i]
            start = angle
            end = i === angles.length - 1 ? angles[0] + 360 : angles[i + 1]
            if (end - start > biggestGap.end - biggestGap.start) {
              biggestGap.start = start
              biggestGap.end = end
            }
          }
          const separation =
            (biggestGap.end - biggestGap.start) /
            (nodePair.relationships.length + 1)
          for (let i = 0; i < nodePair.relationships.length; i++) {
            const relationship = nodePair.relationships[i]
            relationship.naturalAngle =
              (biggestGap.start + (i + 1) * separation - 90) % 360
          }
        } else {
          const separation = 360 / nodePair.relationships.length
          for (let i = 0; i < nodePair.relationships.length; i++) {
            const relationship = nodePair.relationships[i]
            relationship.naturalAngle = i * separation
          }
        }
      }
    }
  }

  layoutRelationships(graph: Graph): void {
    const nodePairs = graph.groupedRelationships()

    this.computeGeometryForNonLoopArrows(nodePairs)
    this.distributeAnglesForLoopArrows(nodePairs, graph.relationships())

    for (const nodePair of nodePairs) {
      for (const relationship of nodePair.relationships) {
        delete relationship.arrow
      }

      const middleRelationshipIndex = (nodePair.relationships.length - 1) / 2
      const defaultDeflectionStep = 30
      const maximumTotalDeflection = 150
      const numberOfSteps = nodePair.relationships.length - 1
      const totalDeflection = defaultDeflectionStep * numberOfSteps

      const deflectionStep =
        totalDeflection > maximumTotalDeflection
          ? maximumTotalDeflection / numberOfSteps
          : defaultDeflectionStep

      for (let i = 0; i < nodePair.relationships.length; i++) {
        const relationship = nodePair.relationships[i]
        const shaftWidth =
          parseFloat(
            this.style.forRelationship(relationship).get('shaft-width')
          ) || 2
        const headWidth = shaftWidth + 6
        const headHeight = headWidth

        if (nodePair.isLoop()) {
          //TODO fix types
          // @ts-expect-error
          relationship.arrow = new LoopArrow(
            relationship.source.radius,
            40,
            defaultDeflectionStep,
            shaftWidth,
            headWidth,
            headHeight,
            // @ts-expect-error
            relationship.captionHeight
          )
        } else {
          if (i === middleRelationshipIndex) {
            relationship.arrow = new StraightArrow(
              relationship.source.radius,
              relationship.target.radius,
              // @ts-expect-error
              relationship.centreDistance,
              shaftWidth,
              headWidth,
              headHeight,
              relationship.captionLayout
            )
          } else {
            let deflection = deflectionStep * (i - middleRelationshipIndex)

            if (nodePair.nodeA !== relationship.source) {
              deflection *= -1
            }

            relationship.arrow = new ArcArrow(
              relationship.source.radius,
              relationship.target.radius,
              // @ts-expect-error
              relationship.centreDistance,
              deflection,
              shaftWidth,
              headWidth,
              headHeight,
              relationship.captionLayout
            )
          }
        }

        ;[relationship.shortCaption, relationship.shortCaptionLength] =
          // @ts-expect-error
          relationship.arrow.shaftLength > relationship.captionLength
            ? [relationship.caption, relationship.captionLength]
            : this.shortenCaption(
                relationship,
                // @ts-expect-error
                relationship.caption,
                // @ts-expect-error
                relationship.arrow.shaftLength
              )
      }
    }
  }
}
