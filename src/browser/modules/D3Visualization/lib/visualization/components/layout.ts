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
import d3 from 'd3'

import cloneArray from '../utils/arrays'
import circularLayout from '../utils/circularLayout'
import Graph from './Graph'
import collision from './collision'

type ForceLayout = {
  update: (graph: Graph, size: [number, number]) => any
  drag: any
  collectStats: () => {
    layoutTime: number
    layoutSteps: number
  }
}
export type Layout = { init: (render: () => number) => ForceLayout }
export type AvailableLayouts = Record<'force', () => Layout>

const layout: AvailableLayouts = {
  force: () => ({
    init: render => {
      const linkDistance = 45

      const d3force = d3.layout
        .force()
        .linkDistance(
          (relationship: any) =>
            relationship.source.radius +
            relationship.target.radius +
            linkDistance
        )
        .charge(-1000)

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

      const accelerateLayout = function () {
        let maxStepsPerTick = 100
        const maxAnimationFramesPerSecond = 60
        const maxComputeTime = 1000 / maxAnimationFramesPerSecond
        const now =
          window.performance && window.performance.now
            ? () => window.performance.now()
            : () => Date.now()

        const d3Tick = d3force.tick
        //@ts-expect-error
        d3force.tick = function () {
          const startTick = now()
          let step = maxStepsPerTick
          while (step-- && now() - startTick < maxComputeTime) {
            const startCalcs = now()
            currentStats.layoutSteps++

            //@ts-expect-error This only works at runtime, fix when updating d3
            collision.avoidOverlap(d3force.nodes())

            if (d3Tick()) {
              maxStepsPerTick = 2
              return true
            }
            currentStats.layoutTime += now() - startCalcs
          }
          render()
          return false
        }
      }

      accelerateLayout()

      const oneRelationshipPerPairOfNodes = (graph: Graph) =>
        Array.from(graph.groupedRelationships()).map(
          pair => pair.relationships[0]
        )

      const update = function (graph: Graph, size: [number, number]) {
        const nodes = cloneArray(graph.nodes())
        const relationships = oneRelationshipPerPairOfNodes(graph)

        const radius = (nodes.length * linkDistance) / (Math.PI * 2)
        const center = {
          x: size[0] / 2,
          y: size[1] / 2
        }
        circularLayout(nodes, center, radius)

        return d3force.nodes(nodes).links(relationships).size(size).start()
      }

      const drag = d3force.drag
      return { update, drag, collectStats }
    }
  })
}

export default layout
