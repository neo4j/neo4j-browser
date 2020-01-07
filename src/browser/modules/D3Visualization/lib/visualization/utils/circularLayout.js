/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

export default function circularLayout(nodes, center, radius) {
  const unlocatedNodes = []
  for (const node of Array.from(nodes)) {
    if (!(node.x != null && node.y != null)) {
      unlocatedNodes.push(node)
    }
  }
  return (() => {
    const result = []
    for (let i = 0; i < unlocatedNodes.length; i++) {
      const n = unlocatedNodes[i]
      n.x =
        center.x + radius * Math.sin((2 * Math.PI * i) / unlocatedNodes.length)
      result.push(
        (n.y =
          center.y +
          radius * Math.cos((2 * Math.PI * i) / unlocatedNodes.length))
      )
    }
    return result
  })()
}
