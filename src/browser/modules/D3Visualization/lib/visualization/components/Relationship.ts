import ArcArrow from '../utils/arcArrow'
import StraightArrow from '../utils/StraightArrow'
import Node from './Node'

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
export type RelationShipCaptionLayout = 'internal' | 'external'
type PropertyItem = { key: string; value: string; originalType: string }
export default class Relationship {
  id: string
  propertyList: PropertyItem[]
  propertyMap: Record<string, string>
  source: Node
  target: Node
  type: string
  isNode = false
  isRelationship = true

  // values other code thinks relationship should have // TODO intizianio check if valid
  internal: boolean | undefined
  caption: string | undefined
  captionHeight: number | undefined
  captionLayout: RelationShipCaptionLayout | undefined
  captionLength: number | undefined
  naturalAngle: number | undefined
  arrow: ArcArrow | StraightArrow | undefined
  selected: boolean
  shortCaption: string | undefined
  shortCaptionLength: number | undefined
  centreDistance: number | undefined

  constructor(
    id: string,
    source: Node,
    target: Node,
    type: string,
    properties: Record<string, string>,
    propertyTypes: Record<string, string>
  ) {
    this.id = id
    this.source = source
    this.target = target
    this.type = type
    this.propertyMap = properties
    this.propertyList = Object.keys(this.propertyMap || {}).reduce(
      (acc: PropertyItem[], key) =>
        acc.concat([
          { key, originalType: propertyTypes[key], value: properties[key] }
        ]),
      []
    )

    this.selected = false
  }

  toJSON(): Record<string, string> {
    return this.propertyMap
  }

  isLoop(): boolean {
    return this.source === this.target
  }
}
