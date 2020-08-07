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
import measureText from './textMeasurement'
import distributeCircular from './circumferentialDistribution'
import StraightArrow from './straightArrow'
import ArcArrow from './arcArrow'

export default class circumferentialRelationshipRouting {
  constructor(style) {
    this.style = style
  }

  measureRelationshipCaption(relationship, caption) {
    const fontFamily = 'sans-serif'
    const fontSize = parseFloat(
      this.style.forRelationship(relationship).get('font-size')
    )
    const padding = parseFloat(
      this.style.forRelationship(relationship).get('padding')
    )
    return measureText(caption, fontFamily, fontSize) + padding * 2
  }

  captionFitsInsideArrowShaftWidth(relationship) {
    return (
      parseFloat(this.style.forRelationship(relationship).get('shaft-width')) >
      parseFloat(this.style.forRelationship(relationship).get('font-size'))
    )
  }

  measureRelationshipCaptions(relationships) {
    return (() => {
      const result = []
      for (const relationship of Array.from(relationships)) {
        relationship.captionLength = this.measureRelationshipCaption(
          relationship,
          relationship.type
        )
        result.push(
          (relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(
            relationship
          )
            ? 'internal'
            : 'external')
        )
      }
      return result
    })()
  }

  shortenCaption(relationship, caption, targetWidth) {
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

  layoutRelationships(graph) {
    let dx, dy
    for (var relationship of Array.from(graph.relationships())) {
      dx = relationship.target.x - relationship.source.x
      dy = relationship.target.y - relationship.source.y
      relationship.naturalAngle =
        ((Math.atan2(dy, dx) / Math.PI) * 180 + 180) % 360
      delete relationship.arrow
    }

    const sortedNodes = graph
      .nodes()
      .sort((a, b) => b.relationshipCount(graph) - a.relationshipCount(graph))

    return (() => {
      const result = []
      for (var node of Array.from(sortedNodes)) {
        var angle
        const relationships = []
        for (relationship of Array.from(graph.relationships())) {
          if (relationship.source === node || relationship.target === node) {
            relationships.push(relationship)
          }
        }

        const arrowAngles = { floating: {}, fixed: {} }
        var relationshipMap = {}
        for (relationship of Array.from(relationships)) {
          relationshipMap[relationship.id] = relationship

          if (node === relationship.source) {
            if (relationship.hasOwnProperty('arrow')) {
              arrowAngles.fixed[relationship.id] =
                relationship.naturalAngle + relationship.arrow.deflection
            } else {
              arrowAngles.floating[relationship.id] = relationship.naturalAngle
            }
          }
          if (node === relationship.target) {
            if (relationship.hasOwnProperty('arrow')) {
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

        var distributedAngles = {}
        for (var id in arrowAngles.floating) {
          angle = arrowAngles.floating[id]
          distributedAngles[id] = angle
        }
        for (id in arrowAngles.fixed) {
          angle = arrowAngles.fixed[id]
          distributedAngles[id] = angle
        }

        if (relationships.length > 1) {
          distributedAngles = distributeCircular(arrowAngles, 30)
        }

        result.push(
          (() => {
            const result1 = []
            for (id in distributedAngles) {
              angle = distributedAngles[id]
              relationship = relationshipMap[id]
              if (!relationship.hasOwnProperty('arrow')) {
                let ref
                const deflection =
                  node === relationship.source
                    ? angle - relationship.naturalAngle
                    : (relationship.naturalAngle - angle + 180) % 360

                const shaftRadius =
                  parseFloat(
                    this.style.forRelationship(relationship).get('shaft-width')
                  ) / 2 || 2
                const headRadius = shaftRadius + 3
                const headHeight = headRadius * 2

                dx = relationship.target.x - relationship.source.x
                dy = relationship.target.y - relationship.source.y

                const square = distance => distance * distance
                const centreDistance = Math.sqrt(square(dx) + square(dy))

                if (Math.abs(deflection) < Math.PI / 180) {
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

                result1.push(
                  ([
                    relationship.shortCaption,
                    relationship.shortCaptionLength
                  ] = Array.from(
                    (ref =
                      relationship.arrow.shaftLength >
                      relationship.captionLength
                        ? [relationship.caption, relationship.captionLength]
                        : this.shortenCaption(
                            relationship,
                            relationship.caption,
                            relationship.arrow.shaftLength
                          ))
                  )),
                  ref
                )
              } else {
                result1.push(undefined)
              }
            }
            return result1
          })()
        )
      }
      return result
    })()
  }
}
