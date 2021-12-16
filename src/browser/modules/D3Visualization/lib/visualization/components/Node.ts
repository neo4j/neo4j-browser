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

type NodeProperties = { [key: string]: number | string | boolean }
export type NodeCaptionLine = {
  node: Node
  text: string
  baseline: number
  remainingWidth: number
}

export default class Node {
  id: string
  labels: string[]
  propertyList: {
    key: string
    type: string
    value: number | string | boolean
  }[]
  propertyMap: NodeProperties
  isNode = true
  isRelationship = false

  // Visualisation properties
  radius: number
  caption: NodeCaptionLine[]
  selected: boolean
  expanded: boolean
  minified: boolean

  constructor(
    id: string,
    labels: string[],
    properties: NodeProperties,
    propertyTypes: Record<string, string>
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
  }

  toJSON(): NodeProperties {
    return this.propertyMap
  }

  relationshipCount(graph: any): number {
    let count = 0
    for (const relationship of Array.from(graph.relationships())) {
      if (
        (relationship as any).source === this ||
        (relationship as any).target === this
      )
        count++
    }
    return count
  }
}
