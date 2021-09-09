export type VizItem =
  | NodeItem
  | ContextMenuItem
  | RelationshipItem
  | CanvasItem
  | StatusItem

type Neo4jValue = unknown
export type VizNodeProperty = { key: string; value: Neo4jValue }

export type NodeItem = {
  type: 'node'
  item: {
    id: string
    labels: string[]
    properties: VizNodeProperty[]
  }
}

type ContextMenuItem = {
  type: 'context-menu-item'
  item: {
    label: string
    content: string
    selection: string
  }
}

type StatusItem = {
  type: 'status-item'
  item: string
}

export type RelationshipItem = {
  type: 'relationship'
  item: {
    id: string
    type: string
    properties: VizNodeProperty[]
  }
}

type CanvasItem = {
  type: 'canvas'
  item: {
    nodeCount: number
    relationshipCount: number
  }
}
