import { NodeModel } from './models/Node'
import { RelationshipModel } from './models/Relationship'

export type VizItem =
  | NodeItem
  | ContextMenuItem
  | RelationshipItem
  | CanvasItem
  | StatusItem

export type VizItemProperty = { key: string; value: string; type: string }

export type NodeItem = {
  type: 'node'
  item: Pick<NodeModel, 'id' | 'labels' | 'propertyList'>
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
  item: Pick<RelationshipModel, 'id' | 'type' | 'propertyList'>
}

type CanvasItem = {
  type: 'canvas'
  item: {
    nodeCount: number
    relationshipCount: number
  }
}
