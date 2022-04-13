import {
  Simulation,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  forceCenter
} from 'd3-force'
import { uniqBy } from 'lodash-es'

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
import {
  calculateRadius,
  circularLayout
} from '../GraphVisualizer/Graph/visualization/utils/circularLayout'
import { GraphModel } from '../models/Graph'
import { NodeModel } from '../models/Node'
import { RelationshipModel } from '../models/Relationship'

class ForceSimulation {
  private _graph: GraphModel

  private _simulationCenter: { x: number; y: number }
  private _simulation: Simulation<NodeModel, RelationshipModel>
  private _nodesToSimulate: NodeModel[]
  private _shouldSimulateAllNodes: boolean
  private _endSimulationCallback: () => void

  constructor(graph: GraphModel, private render: (nodeIds?: string[]) => void) {
    this._graph = graph

    this._simulationCenter = { x: 0, y: 0 }
    this._endSimulationCallback = () => undefined

    this._simulation = forceSimulation<NodeModel, RelationshipModel>()
      .velocityDecay(VELOCITY_DECAY)
      .force('charge', forceManyBody().strength(FORCE_CHARGE))
      .force('centerX', forceX(0).strength(FORCE_CENTER_X))
      .force('centerY', forceY(0).strength(FORCE_CENTER_Y))
      .on('tick', () => {
        console.log(
          'tick' /* , this._nodesToSimulate, this._simulationCenter */
        )
        this._simulation.tick(TICKS_PER_RENDER)
        this._nodesToSimulate.length === 0
          ? render()
          : render(this._nodesToSimulate.map(node => node.id))
      })
      .on('end', () => {
        console.log('end simulation')
        this._endSimulationCallback()
      })
      .stop()

    this._nodesToSimulate = []

    this._shouldSimulateAllNodes = true
  }

  set shouldSimulateAllNodes(value: boolean) {
    this._shouldSimulateAllNodes = value
    if (this._shouldSimulateAllNodes) {
      this._nodesToSimulate = this._graph.getNodes()
      this._simulationCenter = { x: 0, y: 0 }

      this._simulation.nodes(this._nodesToSimulate).force('center', null)
    }
  }

  simulateNodes(nodes: NodeModel[], center?: { x: number; y: number }): void {
    console.log('simulate nodes')

    const radius = calculateRadius(nodes.length, LINK_DISTANCE)

    this._simulationCenter = this._shouldSimulateAllNodes
      ? { x: 0, y: 0 }
      : { x: center?.x ?? 0, y: center?.y ?? 0 }
    circularLayout(nodes, this._simulationCenter, radius)

    if (this._shouldSimulateAllNodes) {
      this._nodesToSimulate = this._graph.getNodes()
    } else {
      const adjacentNodes = this._graph
        .getNodes()
        .filter(
          node =>
            Math.pow(node.x - this._simulationCenter.x, 2) +
              Math.pow(node.y - this._simulationCenter.y, 2) -
              Math.pow(radius * 5, 2) <=
            0
        )
      console.log('find nodes', adjacentNodes)
      this._nodesToSimulate = nodes.concat(adjacentNodes)
    }

    this._simulation
      .nodes(uniqBy(this._nodesToSimulate, 'id'))
      .force('collide', forceCollide<NodeModel>().radius(FORCE_COLLIDE_RADIUS))
      .force(
        'center',
        forceCenter(this._simulationCenter.x, this._simulationCenter.y)
      )
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

  restart(endSimulationCallback: () => void): void {
    this._endSimulationCallback = endSimulationCallback
    this._simulation.alphaMin(DEFAULT_ALPHA_MIN).alpha(DEFAULT_ALPHA).restart()
  }

  simulateNodeDrag(endSimulationCallback: () => void): void {
    this._endSimulationCallback = endSimulationCallback
    // Set alphaTarget to a value higher than alphaMin so the simulation
    // isn't stopped while nodes are being dragged.
    this._simulation
      .alphaTarget(DRAGGING_ALPHA_TARGET)
      .alpha(DEFAULT_ALPHA)
      .restart()
  }

  stopSimulateNodeDrag(): void {
    // Reset alphaTarget so the simulation cools down and stops.
    this._simulation.alphaTarget(DEFAULT_ALPHA_TARGET)
  }
}

export default ForceSimulation
