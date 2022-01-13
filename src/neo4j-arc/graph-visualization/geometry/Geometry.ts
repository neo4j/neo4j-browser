import { GraphModel } from '../models/Graph'
import { GraphStyleModel } from '../models/GraphStyle'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'
import { fitCaptionIntoCircle } from '../utils/textWarp'
import PairwiseArcsRelationshipRouting from './PairwiseArcsRelationshipRouting'

class Geometry {
  private _graph: GraphModel
  private _style: GraphStyleModel
  pairwiseArcsRelationshipRouting: PairwiseArcsRelationshipRouting

  constructor(graph: GraphModel, style: GraphStyleModel) {
    this._graph = graph
    this._style = style
    this.pairwiseArcsRelationshipRouting = new PairwiseArcsRelationshipRouting(
      graph,
      style
    )
  }

  setNodeRadii(node: NodeModel): void {
    node.radius = parseFloat(this._style.forNode(node).get('diameter')) / 2
  }

  formatNodeCaption(node: NodeModel): void {
    node.caption = fitCaptionIntoCircle(
      node,
      this._style,
      document
        .createElement('canvas')
        .getContext('2d') as CanvasRenderingContext2D
    )
  }

  formatRelationshipCaption(relationship: RelationshipModel): void {
    const template = this._style.forRelationship(relationship).get('caption')
    relationship.caption = this._style.interpolate(template, relationship)
  }
}

export default Geometry
