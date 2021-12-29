import Relationship from '../lib/visualization/components/Relationship'
import VizNode from '../lib/visualization/components/VizNode'

export type VizItem =
  | NodeItem
  | ContextMenuItem
  | RelationshipItem
  | CanvasItem
  | StatusItem

export type VizItemProperty = { key: string; value: string; type: string }

type NodeItem = {
  type: 'node'
  item: Pick<VizNode, 'id' | 'labels' | 'propertyList'>
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
  item: Pick<Relationship, 'id' | 'type' | 'propertyList'>
}

type CanvasItem = {
  type: 'canvas'
  item: {
    nodeCount: number
    relationshipCount: number
  }
}
