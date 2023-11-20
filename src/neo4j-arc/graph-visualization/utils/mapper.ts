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
import { GraphModel } from '../models/Graph'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'
import { BasicNode, BasicRelationship } from 'neo4j-arc/common'
import { optionalToString } from './utils'

const mapProperties = (_: any) => Object.assign({}, ...stringifyValues(_))
const stringifyValues = (obj: any) =>
  Object.keys(obj).map(k => ({
    [k]: obj[k] === null ? 'null' : optionalToString(obj[k])
  }))

export function createGraph(
  nodes: BasicNode[],
  relationships: BasicRelationship[]
): GraphModel {
  const graph = new GraphModel()
  graph.addNodes(mapNodes(nodes))
  graph.addRelationships(mapRelationships(relationships, graph))
  return graph
}

export function mapNodes(nodes: BasicNode[]): NodeModel[] {
  return nodes.map(
    node =>
      new NodeModel(
        node.id,
        node.labels,
        mapProperties(node.properties),
        node.propertyTypes,
        node.elementId
      )
  )
}

export function mapRelationships(
  relationships: BasicRelationship[],
  graph: GraphModel
): RelationshipModel[] {
  return relationships.map(rel => {
    const source = graph.findNode(rel.startNodeId)
    const target = graph.findNode(rel.endNodeId)
    return new RelationshipModel(
      rel.id,
      source,
      target,
      rel.type,
      mapProperties(rel.properties),
      rel.propertyTypes,
      rel.elementId
    )
  })
}

export type GraphStatsLabels = Record<
  string,
  { count: number; properties: Record<string, string> }
>
export type GraphStatsRelationshipTypes = Record<
  string,
  { count: number; properties: Record<string, string> }
>
export type GraphStats = {
  labels?: GraphStatsLabels
  relTypes?: GraphStatsRelationshipTypes
}

export function getGraphStats(graph: GraphModel): GraphStats {
  const labelStats: GraphStatsLabels = {}
  const relTypeStats: GraphStatsRelationshipTypes = {}
  graph.nodes().forEach(node => {
    node.labels.forEach(label => {
      if (labelStats['*']) {
        labelStats['*'].count = labelStats['*'].count + 1
      } else {
        labelStats['*'] = {
          count: 1,
          properties: {}
        }
      }
      if (labelStats[label]) {
        labelStats[label].count = labelStats[label].count + 1
        labelStats[label].properties = {
          ...labelStats[label].properties,
          ...node.propertyMap
        }
      } else {
        labelStats[label] = {
          count: 1,
          properties: node.propertyMap
        }
      }
    })
  })
  graph.relationships().forEach(rel => {
    if (relTypeStats['*']) {
      relTypeStats['*'].count = relTypeStats['*'].count + 1
    } else {
      relTypeStats['*'] = {
        count: 1,
        properties: {}
      }
    }
    if (relTypeStats[rel.type]) {
      relTypeStats[rel.type].count = relTypeStats[rel.type].count + 1
      relTypeStats[rel.type].properties = {
        ...relTypeStats[rel.type].properties,
        ...rel.propertyMap
      }
    } else {
      relTypeStats[rel.type] = {
        count: 1,
        properties: rel.propertyMap
      }
    }
  })
  return { labels: labelStats, relTypes: relTypeStats }
}
