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
import { ArcArrow } from '../utils/ArcArrow'
import { LoopArrow } from '../utils/LoopArrow'
import { StraightArrow } from '../utils/StraightArrow'
import { NodeModel } from './Node'

export type RelationshipCaptionLayout = 'internal' | 'external'
export class RelationshipModel {
  id: string
  elementId: string
  propertyList: VizItemProperty[]
  propertyMap: Record<string, string>
  source: NodeModel
  target: NodeModel
  type: string
  isNode = false
  isRelationship = true

  naturalAngle: number
  caption: string
  captionLength: number
  captionHeight: number
  captionLayout: RelationshipCaptionLayout
  shortCaption: string | undefined
  shortCaptionLength: number | undefined
  selected: boolean
  centreDistance: number
  internal: boolean | undefined
  arrow: ArcArrow | LoopArrow | StraightArrow | undefined

  constructor(
    id: string,
    source: NodeModel,
    target: NodeModel,
    type: string,
    properties: Record<string, string>,
    propertyTypes: Record<string, string>,
    elementId: string
  ) {
    this.id = id
    this.source = source
    this.target = target
    this.type = type
    this.propertyMap = properties
    this.propertyList = Object.keys(this.propertyMap || {}).reduce(
      (acc: VizItemProperty[], key) =>
        acc.concat([{ key, type: propertyTypes[key], value: properties[key] }]),
      []
    )

    this.selected = false
    // These values are overriden as part of the initial layouting of the graph
    this.naturalAngle = 0
    this.caption = ''
    this.captionLength = 0
    this.captionHeight = 0
    this.captionLayout = 'internal'
    this.centreDistance = 0

    this.elementId = elementId
  }

  toJSON(): Record<string, string> {
    return this.propertyMap
  }

  isLoop(): boolean {
    return this.source === this.target
  }
}
