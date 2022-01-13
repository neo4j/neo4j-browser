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
import { NodeModel } from './Node'
import NodePairModel from './NodePair'
import { RelationshipModel } from './Relationship'

export class GraphModel {
  private _nodes: NodeModel[]
  private _relationships: RelationshipModel[]
  private _nodeMap: Record<string, NodeModel>
  private _expandedNodeMap: Record<string, string[]>
  private _relationshipMap: Record<string, RelationshipModel>

  constructor() {
    this.addNodes = this.addNodes.bind(this)
    this.removeNode = this.removeNode.bind(this)
    this.updateNode = this.updateNode.bind(this)
    this.removeConnectedRelationships =
      this.removeConnectedRelationships.bind(this)
    this.addRelationships = this.addRelationships.bind(this)
    this.addInternalRelationships = this.addInternalRelationships.bind(this)
    this.pruneInternalRelationships = this.pruneInternalRelationships.bind(this)
    this.findNodeById = this.findNodeById.bind(this)
    this.findNodeNeighbourIds = this.findNodeNeighbourIds.bind(this)
    this.findRelationshipById = this.findRelationshipById.bind(this)
    this.findAllRelationshipToNode = this.findAllRelationshipToNode.bind(this)
    this._nodes = []
    this._relationships = []
    this._nodeMap = {}
    this._expandedNodeMap = {}
    this._relationshipMap = {}
  }

  getNodes(): NodeModel[] {
    return this._nodes
  }

  getRelationships(): RelationshipModel[] {
    return this._relationships
  }

  groupedRelationships(): NodePairModel[] {
    const groups: Record<string, NodePairModel> = {}
    for (const relationship of this._relationships) {
      let nodePair = new NodePairModel(relationship.source, relationship.target)

      nodePair =
        groups[nodePair.toString()] != null
          ? groups[nodePair.toString()]
          : nodePair

      nodePair.relationships.push(relationship)

      groups[nodePair.toString()] = nodePair
    }

    return Object.values(groups)
  }

  addNodes(nodes: NodeModel[]): void {
    for (const node of nodes) {
      if (!this.findNodeById(node.id)) {
        this._nodeMap[node.id] = node
        this._nodes.push(node)
      }
    }
  }

  addExpandedNodes = (node: NodeModel, nodes: NodeModel[]): void => {
    for (const expandedNode of nodes) {
      if (!this.findNodeById(expandedNode.id)) {
        this._nodeMap[expandedNode.id] = expandedNode
        this._nodes.push(expandedNode)
        this._expandedNodeMap[node.id] = Array.from(
          new Set(
            (this._expandedNodeMap[node.id] ?? []).concat([expandedNode.id])
          )
        )
      }
    }
    console.log(this._expandedNodeMap)
  }

  removeNode(node: NodeModel): void {
    if (this.findNodeById(node.id)) {
      delete this._nodeMap[node.id]
      this._nodes.splice(this._nodes.indexOf(node), 1)
    }
  }

  collapseNode = (
    node: NodeModel,
    {
      nodes,
      relationships
    }: { nodes: NodeModel[]; relationships: RelationshipModel[] }
  ): { nodes: NodeModel[]; relationships: RelationshipModel[] } => {
    if (!this._expandedNodeMap[node.id]) {
      return { nodes, relationships }
    }
    console.log(this._expandedNodeMap)
    this._expandedNodeMap[node.id].forEach(id => {
      const expandedNode = this._nodeMap[id]
      nodes = nodes.concat([expandedNode])
      relationships = relationships.concat(
        this.findAllRelationshipToNode(expandedNode)
      )
      this.collapseNode(expandedNode, { nodes, relationships })
      this.removeConnectedRelationships(expandedNode)
      this.removeNode(expandedNode)
    })
    this._expandedNodeMap[node.id] = []
    return { nodes, relationships }
  }

  updateNode(node: NodeModel): void {
    if (this.findNodeById(node.id)) {
      this.removeNode(node)
      node.expanded = false
      this.addNodes([node])
    }
  }

  removeConnectedRelationships(node: NodeModel): void {
    for (const relationship of this.findAllRelationshipToNode(node)) {
      this.updateNode(relationship.source)
      this.updateNode(relationship.target)
      this._relationships.splice(this._relationships.indexOf(relationship), 1)
      delete this._relationshipMap[relationship.id]
    }
  }

  addRelationships(relationships: RelationshipModel[]): void {
    for (const relationship of relationships) {
      if (!this.findRelationshipById(relationship.id)) {
        this._relationshipMap[relationship.id] = relationship
        this._relationships.push(relationship)
      }
    }
  }

  addInternalRelationships(relationships: RelationshipModel[]): void {
    for (const relationship of relationships) {
      relationship.internal = true
      if (!this.findRelationshipById(relationship.id)) {
        this._relationshipMap[relationship.id] = relationship
        this._relationships.push(relationship)
      }
    }
  }

  pruneInternalRelationships(): void {
    const relationships = this._relationships.filter(
      relationship => !relationship.internal
    )
    this._relationshipMap = {}
    this._relationships = []
    this.addRelationships(relationships)
  }

  findNodeById(id: string): NodeModel | undefined {
    return this._nodeMap[id]
  }

  findNodeNeighbourIds(id: string): string[] {
    return this._relationships
      .filter(
        relationship =>
          relationship.source.id === id || relationship.target.id === id
      )
      .map(relationship => {
        if (relationship.target.id === id) {
          return relationship.source.id
        }
        return relationship.target.id
      })
  }

  findRelationshipById(id: string): RelationshipModel | undefined {
    return this._relationshipMap[id]
  }

  findAllRelationshipToNode(node: NodeModel): RelationshipModel[] {
    return this._relationships.filter(
      relationship =>
        relationship.source.id === node.id || relationship.target.id === node.id
    )
  }

  private addNodePairToNodePairMap(
    nodePairMap: Record<string, NodePairModel>,
    relationship: RelationshipModel
  ): void {
    let nodePair = new NodePairModel(relationship.source, relationship.target)

    nodePair = nodePairMap[nodePair.toString()]
      ? nodePairMap[nodePair.toString()]
      : nodePair

    nodePair.addRelationship(relationship)

    nodePairMap[nodePair.toString()] = nodePair
  }

  getNodePairs(): NodePairModel[] {
    const nodePairMap: Record<string, NodePairModel> = {}
    for (const relationship of this._relationships) {
      this.addNodePairToNodePairMap(nodePairMap, relationship)
    }

    return Object.values(nodePairMap)
  }

  getNodePairsByNodeId(id: string): NodePairModel[] {
    const nodePairMap: Record<string, NodePairModel> = {}
    for (const relationship of this._relationships.filter(
      r => r.source.id === id || r.target.id === id
    )) {
      this.addNodePairToNodePairMap(nodePairMap, relationship)
    }

    return Object.values(nodePairMap)
  }

  resetGraph(): void {
    this._nodeMap = {}
    this._nodes = []
    this._relationshipMap = {}
    this._relationships = []
  }
}
