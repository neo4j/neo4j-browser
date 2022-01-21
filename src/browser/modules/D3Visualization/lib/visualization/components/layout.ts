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
import {
  Simulation,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3-force'

import cloneArray from '../utils/arrays'
import circularLayout from '../utils/circularLayout'
import Graph from './Graph'
import Relationship from './Relationship'
import VizNode from './VizNode'

type ForceLayout = {
  update: (graph: Graph, animate?: boolean) => Simulation<VizNode, Relationship>
  simulation: Simulation<VizNode, Relationship>
}
export type Layout = { init: (render: () => void) => ForceLayout }
export type AvailableLayouts = Record<'force', () => Layout>

const SIMULATION_STARTING_TICKS = 300

const layout: AvailableLayouts = {
  force: () => ({
    init: render => {
      const linkDistance = 45

      const oneRelationshipPerPairOfNodes = (graph: Graph) =>
        Array.from(graph.groupedRelationships()).map(
          pair => pair.relationships[0]
        )

      const simulation = forceSimulation<VizNode, Relationship>()
        .force('charge', forceManyBody().strength(-400))
        .velocityDecay(0.06)
        .on('tick', () => {
          simulation.tick(10)
          render()
        })
        .stop()

      const update = function (graph: Graph, precompute = false) {
        const nodes = cloneArray(graph.nodes())
        const relationships = oneRelationshipPerPairOfNodes(graph)

        const radius = (nodes.length * linkDistance) / (Math.PI * 2)
        const center = {
          x: 0,
          y: 0
        }
        circularLayout(nodes, center, radius)

        simulation
          .nodes(nodes)
          .force(
            'collide',
            forceCollide<VizNode>().radius(node => node.radius + 25)
          )
          .force(
            'link',
            forceLink<VizNode, Relationship>(relationships)
              .id(node => node.id)
              .distance(
                relationship =>
                  relationship.source.radius +
                  relationship.target.radius +
                  linkDistance * 2
              )
          )
          .force('centerX', forceX<VizNode>(center.x).strength(0.03))
          .force('centerY', forceY<VizNode>(center.y).strength(0.03))

        if (precompute) {
          // Precompute the position of nodes instead of running the
          // simulation with the animation and multiple re-renders
          simulation.tick(SIMULATION_STARTING_TICKS)
          render()
        }

        simulation.alphaMin(0.05).alpha(1).restart()
        return simulation
      }

      return { update, simulation }
    }
  })
}

export default layout
