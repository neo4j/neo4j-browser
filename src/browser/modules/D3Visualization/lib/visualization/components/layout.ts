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
  update: (
    graph: Graph,
    size: [number, number],
    animate?: boolean
  ) => Simulation<VizNode, Relationship>
  collectStats: () => {
    layoutTime: number
    layoutSteps: number
  }
  simulation: Simulation<VizNode, Relationship>
}
export type Layout = { init: (render: () => number) => ForceLayout }
export type AvailableLayouts = Record<'force', () => Layout>

let simulationTimeout: null | number = null
export const setSimulationTimeout = (
  simulation: Simulation<VizNode, Relationship>
) => {
  simulationTimeout = setTimeout(() => simulation.stop(), 1500)
}
export const clearSimulationTimeout = () => {
  if (simulationTimeout) {
    clearTimeout(simulationTimeout)
    simulationTimeout = null
  }
}

const SIMULATION_STARTING_TICKS = 800

const layout: AvailableLayouts = {
  force: () => ({
    init: render => {
      const linkDistance = 45

      const newStatsBucket = function () {
        const bucket = {
          layoutTime: 0,
          layoutSteps: 0
        }
        return bucket
      }

      let currentStats = newStatsBucket()

      const collectStats = function () {
        const latestStats = currentStats
        currentStats = newStatsBucket()
        return latestStats
      }

      const oneRelationshipPerPairOfNodes = (graph: Graph) =>
        Array.from(graph.groupedRelationships()).map(
          pair => pair.relationships[0]
        )

      const simulation = forceSimulation<VizNode, Relationship>()
        .force('charge', forceManyBody())
        .force('centerX', forceX().strength(0.005))
        .force('centerY', forceY().strength(0.01))
        .on('tick', () => render())
        .stop()

      const update = function (
        graph: Graph,
        size: [number, number],
        precompute = false
      ) {
        clearSimulationTimeout()
        const nodes = cloneArray(graph.nodes())
        const relationships = oneRelationshipPerPairOfNodes(graph)

        const radius = (nodes.length * linkDistance) / (Math.PI * 2)
        const center = {
          x: size[0] / 2,
          y: size[1] / 2
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
              .distance(100)
          )

        if (precompute) {
          // Precompute the position of nodes instead of running the
          // simulation with the animation and multiple re-renders
          simulation.tick(SIMULATION_STARTING_TICKS)
          render()
        } else {
          simulation.restart()
          setSimulationTimeout(simulation)
        }

        return simulation
      }

      return { update, collectStats, simulation }
    }
  })
}

export default layout
