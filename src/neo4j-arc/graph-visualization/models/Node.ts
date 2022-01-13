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
import { SimulationNodeDatum } from 'd3-force'

import { GraphModel } from './Graph'
import GraphEntityModel from './GraphEntity'

type NodeProperties = { [key: string]: string }
export type NodeCaptionLine = {
  node?: NodeModel
  text: string
  baseline: number
  remainingWidth: number
}

export class NodeModel extends GraphEntityModel implements SimulationNodeDatum {
  labels: string[]

  // Visualisation properties
  radius: number
  caption: NodeCaptionLine[]
  expanded: boolean
  contextMenu?: { menuSelection: string; menuContent: string; label: string }
  hoverFixed: boolean

  // Visualisation properties cherry-picked from d3-force SimulationNodeDataum
  x: number
  y: number
  fx: number | null = null
  fy: number | null = null

  initialPositionCalculated: boolean

  constructor(
    id: string,
    labels: string[],
    properties: Record<string, string>,
    propertyTypes: Record<string, string>
  ) {
    super(id, properties, propertyTypes, true)

    this.labels = labels

    // Initialise visualisation items
    this.radius = 0
    this.caption = []
    this.expanded = false
    this.x = 0
    this.y = 0
    this.hoverFixed = false
    this.initialPositionCalculated = false
  }

  toJSON(): NodeProperties {
    return this.propertyMap
  }

  relationshipCount(graph: GraphModel): number {
    return graph
      .getRelationships()
      .filter(rel => rel.source === this || rel.target === this).length
  }

  hasRelationships(graph: GraphModel): boolean {
    return graph
      .getRelationships()
      .some(rel => rel.source === this || rel.target === this)
  }
}
