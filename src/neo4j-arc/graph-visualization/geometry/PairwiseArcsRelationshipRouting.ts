import { GraphModel } from '../models/Graph'
import { GraphStyleModel } from '../models/GraphStyle'
import NodePairModel from '../models/NodePair'
import { RelationshipModel } from '../models/Relationship'
import { ArcArrow } from '../utils/ArcArrow'
import { LoopArrow } from '../utils/LoopArrow'
import { StraightArrow } from '../utils/StraightArrow'
import { measureText } from '../utils/textMeasurement'

class PairwiseArcsRelationshipRouting {
  private _graph: GraphModel
  private _style: GraphStyleModel

  constructor(graph: GraphModel, style: GraphStyleModel) {
    this._graph = graph
    this._style = style
  }

  measureRelationshipCaptionHeight(relationship: RelationshipModel): number {
    return parseFloat(
      this._style.forRelationship(relationship).get('font-size')
    )
  }

  measureRelationshipCaptionWidth(
    relationship: RelationshipModel,
    caption: string
  ): number {
    const fontFamily = 'sans-serif'
    const padding = parseFloat(
      this._style.forRelationship(relationship).get('padding')
    )

    return (
      measureText(
        caption,
        fontFamily,
        relationship.captionHeight,
        <CanvasRenderingContext2D>(
          document.createElement('canvas').getContext('2d')
        )
      ) +
      padding * 2
    )
  }

  measureRelationshipCaption(relationship: RelationshipModel): void {
    relationship.captionHeight = parseFloat(
      this._style.forRelationship(relationship).get('font-size')
    )
    relationship.captionLength = this.measureRelationshipCaptionWidth(
      relationship,
      relationship.caption
    )

    relationship.captionLayout =
      this.captionFitsInsideArrowShaftWidth(relationship) &&
      !relationship.isLoop()
        ? 'internal'
        : 'external'
  }

  captionFitsInsideArrowShaftWidth(relationship: RelationshipModel): boolean {
    return (
      parseFloat(this._style.forRelationship(relationship).get('shaft-width')) >
      relationship.captionHeight
    )
  }

  shortenCaption(
    relationship: RelationshipModel,
    caption: string,
    targetWidth: number
  ): [string, number] {
    let shortCaption = caption || 'caption'
    while (true) {
      if (shortCaption.length <= 2) {
        return ['', 0]
      }
      shortCaption = `${shortCaption.substring(
        0,
        shortCaption.length - 2
      )}\u2026`
      const width = this.measureRelationshipCaptionWidth(
        relationship,
        shortCaption
      )
      if (width < targetWidth) {
        return [shortCaption, width]
      }
    }
  }

  computeGeometryForNonLoopArrows(nodePairs: NodePairModel[]): void {
    nodePairs.forEach(nodePair => {
      if (!nodePair.isLoop()) {
        const dx = nodePair.nodeA.x - nodePair.nodeB.x
        const dy = nodePair.nodeA.y - nodePair.nodeB.y
        const angle = ((Math.atan2(dy, dx) / Math.PI) * 180 + 360) % 360

        nodePair.relationships.forEach(relationship => {
          relationship.naturalAngle =
            relationship.target === nodePair.nodeA ? (angle + 180) % 360 : angle
          relationship.centreDistance = Math.sqrt(dx ** 2 + dy ** 2)
        })
      }
    })
  }

  distributeAnglesForLoopArrows(
    nodePairs: NodePairModel[],
    relationships: RelationshipModel[]
  ): void {
    for (const nodePair of nodePairs) {
      if (nodePair.isLoop()) {
        let angles = []
        const node = nodePair.nodeA
        for (const relationship of relationships) {
          if (!relationship.isLoop()) {
            if (relationship.source === node) {
              angles.push(relationship.naturalAngle)
            }
            if (relationship.target === node) {
              angles.push(relationship.naturalAngle + 180)
            }
          }
        }
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

  layoutRelationships(nodeId?: string): void {
    const nodePairs = nodeId
      ? this._graph.getNodePairsByNodeId(nodeId)
      : this._graph.getNodePairs()

    this.computeGeometryForNonLoopArrows(nodePairs)
    this.distributeAnglesForLoopArrows(
      nodePairs,
      this._graph.getRelationships()
    )

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
            this._style.forRelationship(relationship).get('shaft-width')
          ) || 2
        const headWidth = shaftWidth + 6
        const headHeight = headWidth

        if (nodePair.isLoop()) {
          relationship.arrow = new LoopArrow(
            relationship.source.radius,
            40,
            defaultDeflectionStep,
            shaftWidth,
            headWidth,
            headHeight,
            relationship.captionHeight
          )
        } else {
          if (i === middleRelationshipIndex) {
            relationship.arrow = new StraightArrow(
              relationship.source.radius,
              relationship.target.radius,
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
          relationship.arrow.shaftLength > relationship.captionLength
            ? [relationship.caption, relationship.captionLength]
            : this.shortenCaption(
                relationship,
                relationship.caption,
                relationship.arrow.shaftLength
              )
      }
    }
  }
}

export default PairwiseArcsRelationshipRouting
