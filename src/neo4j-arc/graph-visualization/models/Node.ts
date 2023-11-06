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
import { VizItemProperty } from 'neo4j-arc/common'
import { GraphModel } from './Graph'

type NodeProperties = { [key: string]: string }
export type NodeCaptionLine = {
  node: NodeModel
  text: string
  baseline: number
  remainingWidth: number
}

export class NodeModel {
  id: string
  elementId: string
  labels: string[]
  propertyList: VizItemProperty[]
  propertyMap: NodeProperties
  isNode = true
  isRelationship = false

  // Visualisation properties
  radius: number
  caption: NodeCaptionLine[]
  selected: boolean
  expanded: boolean
  minified: boolean
  contextMenu?: { menuSelection: string; menuContent: string; label: string }

  x: number
  y: number
  fx: number | null = null
  fy: number | null = null
  hoverFixed: boolean
  initialPositionCalculated: boolean

  constructor(
    id: string,
    labels: string[],
    properties: NodeProperties,
    propertyTypes: Record<string, string>,
    elementId: string
  ) {
    this.id = id
    this.labels = labels
    this.propertyMap = properties
    this.propertyList = Object.keys(properties).map((key: string) => ({
      key,
      type: propertyTypes[key],
      value: properties[key]
    }))

    // Initialise visualisation items
    this.radius = 0
    this.caption = []
    this.selected = false
    this.expanded = false
    this.minified = false
    this.x = 0
    this.y = 0
    this.hoverFixed = false
    this.initialPositionCalculated = false
    this.elementId = elementId
  }

  toJSON(): NodeProperties {
    return this.propertyMap
  }

  relationshipCount(graph: GraphModel): number {
    return graph
      .relationships()
      .filter(rel => rel.source === this || rel.target === this).length
  }

  hasRelationships(graph: GraphModel): boolean {
    return graph
      .relationships()
      .some(rel => rel.source === this || rel.target === this)
  }
}
