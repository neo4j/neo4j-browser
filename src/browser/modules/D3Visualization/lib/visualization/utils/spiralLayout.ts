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
import VizNode from '../components/VizNode'

export default function spiralLayout(
  nodes: VizNode[],
  center: { x: number; y: number }
): void {
  const unlocatedNodes = nodes.filter(node => !node.initialPositionCalculated)

  const turnDistance = 50
  let angle = 0
  unlocatedNodes.forEach((node, i) => {
    const r = Math.sqrt(i / 2 + 1)
    angle += Math.asin(1 / r)

    node.x = center.x + Math.cos(angle) * r * turnDistance
    node.y = center.y + Math.sin(angle) * r * turnDistance

    node.initialPositionCalculated = true
  })
}
