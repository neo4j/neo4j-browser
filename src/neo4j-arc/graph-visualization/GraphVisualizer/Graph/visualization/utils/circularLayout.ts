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
import { NodeModel } from '../../../../models/Node'

export default function circularLayout(
  nodes: NodeModel[],
  center: { x: number; y: number },
  radius: number
): void {
  const unlocatedNodes = nodes.filter(node => !node.initialPositionCalculated)

  unlocatedNodes.forEach((node, i) => {
    node.x =
      center.x + radius * Math.sin((2 * Math.PI * i) / unlocatedNodes.length)

    node.y =
      center.y + radius * Math.cos((2 * Math.PI * i) / unlocatedNodes.length)

    node.initialPositionCalculated = true
  })
}
