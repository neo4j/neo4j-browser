import { NodeModel } from './Node'
import { RelationshipModel } from './Relationship'

class NodePairModel {
  nodeA: NodeModel
  nodeB: NodeModel
  relationships: RelationshipModel[]

  constructor(nodeA: NodeModel, nodeB: NodeModel) {
    if (nodeA.id < nodeB.id) {
      this.nodeA = nodeA
      this.nodeB = nodeB
    } else {
      this.nodeB = nodeA
      this.nodeA = nodeB
    }
    this.relationships = []
  }

  addRelationship(relationship: RelationshipModel): void {
    this.relationships.push(relationship)
  }

  isLoop(): boolean {
    return this.nodeA === this.nodeB
  }

  toString(): string {
    return `${this.nodeA.id}:${this.nodeB.id}`
  }
}

export default NodePairModel
