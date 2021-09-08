import { clone } from 'lodash-es'

interface INode {
  x: number
  px: number
  y: number
  py: number
  outputRelationshipIdSet?: Set<string>
  id: string
  fixed?: boolean
}

interface IRel {
  source: INode
  target: INode
  id: string
}

function addRelToNodeRelSet({ node, id }: { node: INode; id: string }) {
  if (node.outputRelationshipIdSet) {
    node.outputRelationshipIdSet.add(id)
  } else {
    node.outputRelationshipIdSet = new Set(id)
  }
}

// TODO Add an algorithm to pick the farthest root node
function findRootNodeId({ relationships }: { relationships: IRel[] }) {
  const sources = new Set<string>()
  const targets = new Set<string>()
  relationships.forEach(rel => {
    sources.add(rel.source.id)
    targets.add(rel.target.id)
    addRelToNodeRelSet({
      node: rel.source,
      id: rel.id
    })
    // addRelToNodeRelSet({
    //   node: rel.target,
    //   id: rel.id
    // })
  })
  return Array.from(sources).filter(id => !targets.has(id))[0]
}

const verticalNodeGap = 200
const horizontalNodeGap = 100

function placeNode({
  node,
  relationshipMap,
  matrix,
  row = 0
}: {
  node: INode
  relationshipMap: { [key: string]: any }
  matrix: string[][]
  row?: number
}) {
  if (!matrix[row]) {
    matrix[row] = []
  }
  node.y = node.py = verticalNodeGap * row

  let i = 0
  while (matrix[row][i] !== undefined) {
    i++
  }
  node.x = node.px = horizontalNodeGap * i
  node.fixed = true
  matrix[row][i] = node.id

  if (node.outputRelationshipIdSet) {
    Array.from(node.outputRelationshipIdSet).forEach(relId => {
      const rel = relationshipMap[relId]
      if (rel.target.outputRelationshipIdSet) {
        placeNode({
          node: rel.target,
          relationshipMap,
          matrix,
          row: row + 1
        })
      }
    })
  }
}

export function layoutGraphWithRootNodeOnTop({
  relationships,
  nodeMap,
  relationshipMap
}: {
  relationships: any[]
  nodeMap: { [key: string]: any }
  relationshipMap: { [key: string]: any }
}): void {
  const rootNodeId = findRootNodeId({ relationships })
  if (rootNodeId) {
    const matrix: string[][] = []
    placeNode({ node: nodeMap[rootNodeId], relationshipMap, matrix })
    console.log({ matrix })
  }
}
