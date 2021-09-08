import { clone, max, min } from 'lodash-es'

interface INode {
  x: number
  px: number
  y: number
  py: number
  layout: {
    outputNeighbourNodesIdSet?: Set<string>
    depth?: number
  }
  // outputRelationshipIdSet?: Set<string>
  id: string
  fixed?: boolean
}

interface IRel {
  source: INode
  target: INode
  id: string
}

function addRelToNodeRelSet({ node, id }: { node: INode; id: string }) {
  if (node.id !== id) {
    if (node.layout.outputNeighbourNodesIdSet) {
      node.layout.outputNeighbourNodesIdSet.add(id)
    } else {
      node.layout.outputNeighbourNodesIdSet = new Set([id])
    }
  }
}

function calcNodeDepth({
  node,
  nodeMap,
  prevNodesIds,
  depth = 0
}: {
  node: INode
  nodeMap: { [key: string]: any }
  prevNodesIds: Set<string>
  depth?: number
}): number {
  prevNodesIds.add(node.id)
  if (node.layout.outputNeighbourNodesIdSet) {
    return (
      max(
        Array.from(node.layout.outputNeighbourNodesIdSet).map(nodeId => {
          const neighbour: INode = nodeMap[nodeId]
          if (!prevNodesIds.has(neighbour.id)) {
            return calcNodeDepth({
              node: neighbour,
              nodeMap,
              prevNodesIds
            })
          } else {
            return depth
          }
        })
      ) ?? depth
    )
  } else {
    return depth
  }
}

function findRootNodes({
  relationships,
  nodeMap
}: {
  relationships: IRel[]
  nodeMap: { [key: string]: INode }
}): INode[] {
  const sources = new Set<string>()
  const targets = new Set<string>()
  relationships.forEach(rel => {
    rel.source.layout = {}
    rel.target.layout = {}
    rel.source.fixed = false
    rel.target.fixed = false
  })
  relationships.forEach(rel => {
    sources.add(rel.source.id)
    targets.add(rel.target.id)
    addRelToNodeRelSet({
      node: rel.source,
      id: rel.target.id
    })
  })
  return Array.from(sources)
    .filter(id => !targets.has(id))
    .map(id => {
      const node = nodeMap[id]
      node.layout.depth = calcNodeDepth({
        node,
        nodeMap,
        prevNodesIds: new Set()
      })
      return node
    })
    .sort((a, b) => {
      return (a.layout.depth ?? 0) > (b.layout.depth ?? 0) ? -1 : 1
    })
}

const verticalNodeGap = 300
const horizontalNodeGap = 200

function placeNode({
  node,
  nodeMap,
  matrix,
  prevNodesIds,
  row = 0,
  column = 0
}: {
  node: INode
  nodeMap: { [key: string]: any }
  matrix: INode[][]
  row?: number
  column?: number
  prevNodesIds: Set<string>
}) {
  if (!matrix[row]) {
    matrix[row] = []
  }
  node.y = node.py = verticalNodeGap * row

  let i = column
  while (matrix[row][i] !== undefined) {
    i++
  }
  node.x = node.px =
    matrix[row][i - 1] === undefined
      ? horizontalNodeGap * i
      : matrix[row][i - 1].x + horizontalNodeGap
  node.fixed = true
  matrix[row][i] = node
  prevNodesIds.add(node.id)
  if (node.layout.outputNeighbourNodesIdSet) {
    const arr = Array.from(node.layout.outputNeighbourNodesIdSet)
    const neighboursLength = arr.filter(id => {
      const neighbour: INode = nodeMap[id]
      return (
        neighbour.layout.outputNeighbourNodesIdSet &&
        !prevNodesIds.has(neighbour.id)
      )
    }).length
    if (neighboursLength > 1) {
      node.x = node.px =
        node.x + ((neighboursLength - 1) * horizontalNodeGap) / 2
    }
    arr.forEach(nodeId => {
      const neighbour: INode = nodeMap[nodeId]
      if (
        neighbour.layout.outputNeighbourNodesIdSet &&
        !prevNodesIds.has(neighbour.id)
      ) {
        placeNode({
          node: neighbour,
          nodeMap,
          matrix,
          prevNodesIds,
          row: row + 1,
          column: i
        })
      }
    })
  }
}

function findRowForNode({
  node,
  nodeMap,
  prevNodesIds
}: {
  node: INode
  nodeMap: { [key: string]: any }
  prevNodesIds: Set<string>
}): number | undefined {
  prevNodesIds.add(node.id)
  if (node.fixed) {
    return Math.round(node.y / verticalNodeGap)
  } else if (node.layout.outputNeighbourNodesIdSet) {
    return min(
      Array.from(node.layout.outputNeighbourNodesIdSet).map(nodeId => {
        const neighbour: INode = nodeMap[nodeId]
        if (!prevNodesIds.has(neighbour.id)) {
          const result: number | undefined = findRowForNode({
            node: neighbour,
            nodeMap,
            prevNodesIds
          })
          return result ? result - 1 : result
        } else {
          return undefined
        }
      })
    )
  }
  return undefined
}

export function layoutGraphWithRootNodeOnTop({
  relationships,
  nodeMap
}: {
  relationships: any[]
  nodeMap: { [key: string]: any }
  relationshipMap: { [key: string]: any }
}): void {
  const rootNodes = findRootNodes({ relationships, nodeMap })
  if (rootNodes.length > 0) {
    const matrix: INode[][] = []
    const prevNodesIds = new Set<string>()
    rootNodes.forEach((node, index) => {
      let row = 0
      if (index > 0) {
        row = findRowForNode({ node, nodeMap, prevNodesIds: new Set() }) ?? 0
      }
      placeNode({ node, nodeMap, matrix, prevNodesIds, row })
    })
  }
}
