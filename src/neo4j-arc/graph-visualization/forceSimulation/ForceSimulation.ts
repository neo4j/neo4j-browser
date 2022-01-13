import {
  Simulation,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3-force'

import {
  DEFAULT_ALPHA,
  DEFAULT_ALPHA_MIN,
  DEFAULT_ALPHA_TARGET,
  DRAGGING_ALPHA_TARGET,
  FORCE_CENTER_X,
  FORCE_CENTER_Y,
  FORCE_CHARGE,
  FORCE_COLLIDE_RADIUS,
  FORCE_LINK_DISTANCE,
  LINK_DISTANCE,
  PRECOMPUTED_TICKS,
  TICKS_PER_RENDER,
  VELOCITY_DECAY
} from '../constants'
import { circularLayout } from '../layout/utils'
import { GraphModel } from '../models/Graph'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'

class ForceSimulation {
  private _graph: GraphModel
  private _simulation: Simulation<NodeModel, RelationshipModel>

  constructor(
    graph: GraphModel,
    private render: () => void,
    private endSimulationCallback: () => void
  ) {
    this._graph = graph

    this._simulation = forceSimulation<NodeModel, RelationshipModel>()
      .velocityDecay(VELOCITY_DECAY)
      .force('charge', forceManyBody().strength(FORCE_CHARGE))
      .force('centerX', forceX(0).strength(FORCE_CENTER_X))
      .force('centerY', forceY(0).strength(FORCE_CENTER_Y))
      .on('tick', () => {
        console.log('tick')
        this._simulation.tick(TICKS_PER_RENDER)
        render()
      })
      .on('end', () => {
        console.log('end simulation')
        endSimulationCallback()
      })
      .stop()
  }

  simulateNodes(): void {
    console.log('simulate nodes')
    const nodes = this._graph.getNodes()
    const radius = (nodes.length * LINK_DISTANCE) / (Math.PI * 2)
    const center = {
      x: 0,
      y: 0
    }
    circularLayout(nodes, center, radius)

    this._simulation
      .nodes(nodes)
      .force('collide', forceCollide<NodeModel>().radius(FORCE_COLLIDE_RADIUS))
  }

  simulateRelationships(): void {
    // const relationships = oneRelationshipPerPairOfNodes(graph)
    const relationships = this._graph.getRelationships()

    this._simulation.force(
      'link',
      forceLink<NodeModel, RelationshipModel>(relationships)
        .id(node => node.id)
        .distance(FORCE_LINK_DISTANCE)
    )
  }

  precompute(): void {
    this._simulation.stop().tick(PRECOMPUTED_TICKS)
    this.render()
  }

  restart(): void {
    this._simulation.alphaMin(DEFAULT_ALPHA_MIN).alpha(DEFAULT_ALPHA).restart()
  }

  simulateNodeDrag(): void {
    // set alphaTarget to a value higher than alphaMin so the simulation
    // isn't stopped while nodes are being dragged.
    this._simulation
      .alphaTarget(DRAGGING_ALPHA_TARGET)
      .alpha(DEFAULT_ALPHA)
      .restart()
  }

  stopSimulateNodeDrag(): void {
    // reset alphaTarget so the simulation cools down and stops
    this._simulation.alphaTarget(DEFAULT_ALPHA_TARGET)
  }
}

export default ForceSimulation
