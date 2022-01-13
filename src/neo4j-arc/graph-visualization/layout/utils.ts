import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation
} from 'd3-force'

import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'

const linkDistance = 45
const center = {
  x: 0,
  y: 0
}

export const circularLayout = (
  nodes: NodeModel[],
  center: { x: number; y: number },
  radius: number
): void => {
  const unlocatedNodes = nodes.filter(node => !node.initialPositionCalculated)

  unlocatedNodes.forEach((node, i) => {
    node.x =
      center.x + radius * Math.sin((2 * Math.PI * i) / unlocatedNodes.length)

    node.y =
      center.y + radius * Math.cos((2 * Math.PI * i) / unlocatedNodes.length)

    node.initialPositionCalculated = true
  })
}

export const initD3Layout = (
  nodes: NodeModel[],
  relationships: RelationshipModel[]
): void => {
  const radius = (nodes.length * linkDistance) / (Math.PI * 2)

  circularLayout(nodes, center, radius)

  const iterations = 300
  const nodeRepulsion = -400

  forceSimulation<NodeModel, RelationshipModel>(nodes)
    .force(
      'link',
      forceLink<NodeModel, RelationshipModel>(relationships)
        .id(node => node.id)
        .distance(25 + 25 + linkDistance)
    )
    .force('charge', forceManyBody().strength(nodeRepulsion))
    .force('center', forceCenter())
    .stop()
    .tick(iterations)
}
