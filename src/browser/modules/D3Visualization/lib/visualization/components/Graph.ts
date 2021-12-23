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

import Node from './Node'
import Relationship from './Relationship'

type NodeMap = Record<string, string[]>
function uniq<T>(list: T[]): T[] {
  return [...new Set(list)]
}

export default class Graph {
  _nodes: Node[]
  _relationships: Relationship[]
  expandedNodeMap: NodeMap
  nodeMap: Record<string, Node>
  relationshipMap: Record<string, Relationship>

  constructor() {
    this.addNodes = this.addNodes.bind(this)
    this.removeNode = this.removeNode.bind(this)
    this.updateNode = this.updateNode.bind(this)
    this.removeConnectedRelationships = this.removeConnectedRelationships.bind(
      this
    )
    this.addRelationships = this.addRelationships.bind(this)
    this.addInternalRelationships = this.addInternalRelationships.bind(this)
    this.pruneInternalRelationships = this.pruneInternalRelationships.bind(this)
    this.findNode = this.findNode.bind(this)
    this.findNodeNeighbourIds = this.findNodeNeighbourIds.bind(this)
    this.findRelationship = this.findRelationship.bind(this)
    this.findAllRelationshipToNode = this.findAllRelationshipToNode.bind(this)
    this.nodeMap = {}
    this.expandedNodeMap = {}
    this._nodes = []
    this.relationshipMap = {}
    this._relationships = []
  }

  nodes(): Node[] {
    return this._nodes
  }

  relationships(): Relationship[] {
    return this._relationships
  }

  groupedRelationships(): NodePair[] {
    const groups: Record<string, NodePair> = {}
    for (const relationship of this._relationships) {
      let nodePair = new NodePair(relationship.source, relationship.target)

      nodePair =
        groups[nodePair.toString()] != null
          ? groups[nodePair.toString()]
          : nodePair

      nodePair.relationships.push(relationship)

      groups[nodePair.toString()] = nodePair
    }

    return Object.values(groups)
  }

  addNodes(nodes: Node[]): void {
    for (const node of nodes) {
      if (this.findNode(node.id) == null) {
        this.nodeMap[node.id] = node
        this._nodes.push(node)
      }
    }
  }

  addExpandedNodes = (node: Node, nodes: Node[]): void => {
    for (const eNode of Array.from(nodes)) {
      if (this.findNode(eNode.id) == null) {
        this.nodeMap[eNode.id] = eNode
        this._nodes.push(eNode)
        this.expandedNodeMap[node.id] = this.expandedNodeMap[node.id]
          ? uniq(this.expandedNodeMap[node.id].concat([eNode.id]))
          : [eNode.id]
      }
    }
  }

  removeNode(node: Node): void {
    if (this.findNode(node.id) != null) {
      delete this.nodeMap[node.id]
      this._nodes.splice(this._nodes.indexOf(node), 1)
    }
  }

  collapseNode = (node: Node): void => {
    if (!this.expandedNodeMap[node.id]) {
      return
    }
    this.expandedNodeMap[node.id].forEach(id => {
      const eNode = this.nodeMap[id]
      this.collapseNode(eNode)
      this.removeConnectedRelationships(eNode)
      this.removeNode(eNode)
    })
    this.expandedNodeMap[node.id] = []
  }

  updateNode(node: Node): void {
    if (this.findNode(node.id) != null) {
      this.removeNode(node)
      node.expanded = false
      node.minified = true
      this.addNodes([node])
    }
  }

  removeConnectedRelationships(node: Node): void {
    for (const r of Array.from(this.findAllRelationshipToNode(node))) {
      this.updateNode(r.source)
      this.updateNode(r.target)
      this._relationships.splice(this._relationships.indexOf(r), 1)
      delete this.relationshipMap[r.id]
    }
  }

  addRelationships(relationships: Relationship[]): void {
    for (const relationship of Array.from(relationships)) {
      const existingRelationship = this.findRelationship(relationship.id)
      if (existingRelationship != null) {
        existingRelationship.internal = false
      } else {
        relationship.internal = false
        this.relationshipMap[relationship.id] = relationship
        this._relationships.push(relationship)
      }
    }
  }

  addInternalRelationships(relationships: Relationship[]): void {
    for (const relationship of Array.from(relationships)) {
      relationship.internal = true
      if (this.findRelationship(relationship.id) == null) {
        this.relationshipMap[relationship.id] = relationship
        this._relationships.push(relationship)
      }
    }
  }

  pruneInternalRelationships(): void {
    const relationships = this._relationships.filter(
      relationship => !relationship.internal
    )
    this.relationshipMap = {}
    this._relationships = []
    this.addRelationships(relationships)
  }

  findNode(id: string): Node {
    return this.nodeMap[id]
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

  findRelationship(id: string): Relationship {
    return this.relationshipMap[id]
  }

  findAllRelationshipToNode(node: Node): Relationship[] {
    return this._relationships.filter(
      relationship =>
        relationship.source.id === node.id || relationship.target.id === node.id
    )
  }

  resetGraph(): void {
    this.nodeMap = {}
    this._nodes = []
    this.relationshipMap = {}
    this._relationships = []
  }
}

export class NodePair {
  nodeA: Node
  nodeB: Node
  relationships: Relationship[]
  constructor(node1: Node, node2: Node) {
    this.relationships = []
    if (node1.id < node2.id) {
      this.nodeA = node1
      this.nodeB = node2
    } else {
      this.nodeA = node2
      this.nodeB = node1
    }
  }

  isLoop(): boolean {
    return this.nodeA === this.nodeB
  }

  toString(): string {
    return `${this.nodeA.id}:${this.nodeB.id}`
  }
}
