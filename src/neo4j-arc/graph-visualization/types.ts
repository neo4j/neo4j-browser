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
import { BasicNode, BasicNodesAndRels } from 'neo4j-arc/common'

export type VizItem =
  | NodeItem
  | ContextMenuItem
  | RelationshipItem
  | CanvasItem
  | StatusItem

export type NodeItem = {
  type: 'node'
  item: Pick<NodeModel, 'id' | 'elementId' | 'labels' | 'propertyList'>
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
  item: Pick<RelationshipModel, 'id' | 'elementId' | 'type' | 'propertyList'>
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

export type GetNodeNeighboursFn = (
  node: BasicNode | NodeModel,
  currentNeighbourIds: string[],
  callback: (data: BasicNodesAndRels) => void
) => void
