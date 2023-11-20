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
export type BasicNode = {
  id: string
  elementId: string
  labels: string[]
  properties: Record<string, string>
  propertyTypes: Record<string, string>
}
export type BasicRelationship = {
  id: string
  elementId: string
  startNodeId: string
  endNodeId: string
  type: string
  properties: Record<string, string>
  propertyTypes: Record<string, string>
}
export type BasicNodesAndRels = {
  nodes: BasicNode[]
  relationships: BasicRelationship[]
}
export type DeduplicatedBasicNodesAndRels = {
  nodes: BasicNode[]
  relationships: BasicRelationship[]
  limitHit?: boolean
}

export type VizItemProperty = { key: string; value: string; type: string }
