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
import { NodeModel } from './models/Node'
import { RelationshipModel } from './models/Relationship'
import { BasicNode, BasicRelationship } from 'neo4j-arc/common'
import GraphEntityModel from './models/GraphEntity'

export type VItem =
  | NodeItem
  | ContextMenuItem
  | RelationshipItem
  | CanvasItem
  | StatusItem

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

export type ZoomLimitsReached = {
  zoomInLimitReached: boolean
  zoomOutLimitReached: boolean
}

export enum ZoomType {
  IN = 'in',
  OUT = 'out',
  FIT = 'fit'
}

export type ExpandNodeHandler = (
  node: BasicNode | NodeModel,
  currentNeighbourIds: string[],
  callback: (data: {
    nodes: BasicNode[]
    relationships: BasicRelationship[]
  }) => void
) => void

export type GraphChangeType = 'init' | 'update' | 'expand' | 'collapse'

export type GraphChangeHandler = (
  nodes: NodeModel[],
  relationships: RelationshipModel[],
  type: GraphChangeType,
  options?: { center?: { x: number; y: number } }
) => void

export type MoveGfxBetweenLayers = <T extends GraphEntityModel>(
  data: T,
  position: 'front' | 'behind',
  type: 'hover' | 'select'
) => void
