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

const collision = {
  avoidOverlap: (nodes: d3.layout.force.Node[]): void => {
    const q = d3.geom.quadtree(nodes)
    nodes.forEach(n => q.visit(collide(n)))
  }
}

const collide = (node: d3.layout.force.Node) => {
  // TODO solve/understand these errors
  // @ts-expect-error
  let r = node.radius + 10
  // @ts-expect-error
  const nx1 = node.x - r
  const nx2 = node.x + r
  // @ts-expect-error
  const ny1 = node.y - r
  const ny2 = node.y + r
  return (
    quad: d3.geom.quadtree.Node<d3.layout.force.Node>,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    let l, x, y
    if (quad.point && quad.point !== node) {
      // @ts-expect-error
      x = node.x - quad.point.x
      // @ts-expect-error
      y = node.y - quad.point.y
      l = Math.sqrt(x * x + y * y)
      // @ts-expect-error
      r = node.radius + 10 + quad.point.radius
    }
    if ((l as number) < r) {
      l = (((l as number) - r) / (l as number)) * 0.5
      // @ts-expect-error
      node.x -= (x as number) *= l
      // @ts-expect-error
      node.y -= (y as number) *= l
      // @ts-expect-error
      quad.point.x += x
      // @ts-expect-error
      quad.point.y += y
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1
  }
}

export default collision
