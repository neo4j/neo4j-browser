export type VizItem =
  | NodeItem
  | ContextMenuItem
  | RelationshipItem
  | CanvasItem
  | StatusItem
  | LegendItem

export type VizNodeProperty = { key: string; value: string; type: string }

type NodeItem = {
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

type RelationshipItem = {
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

type LegendItem = {
  type: 'legend-item'
  item: {
    selectedRelType?: {
      relType: string
      propertyKeys: string[]
    }
    selectedLabel?: {
      label: string
      propertyKeys: string[]
    }
  }
}
