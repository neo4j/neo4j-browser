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

export default class LoopArrow {
  constructor(
    nodeRadius,
    straightLength,
    spreadDegrees,
    shaftWidth,
    headWidth,
    headLength,
    captionHeight
  ) {
    const spread = (spreadDegrees * Math.PI) / 180
    const r1 = nodeRadius
    const r2 = nodeRadius + headLength
    const r3 = nodeRadius + straightLength
    const loopRadius = r3 * Math.tan(spread / 2)
    const shaftRadius = shaftWidth / 2
    this.shaftLength = loopRadius * 3 + shaftWidth

    class Point {
      constructor(x, y) {
        this.x = x
        this.y = y
      }

      toString() {
        return `${this.x} ${this.y}`
      }
    }

    const normalPoint = function(sweep, radius, displacement) {
      const localLoopRadius = radius * Math.tan(spread / 2)
      const cy = radius / Math.cos(spread / 2)
      return new Point(
        (localLoopRadius + displacement) * Math.sin(sweep),
        cy + (localLoopRadius + displacement) * Math.cos(sweep)
      )
    }
    this.midShaftPoint = normalPoint(0, r3, shaftRadius + captionHeight / 2 + 2)
    const startPoint = (radius, displacement) =>
      normalPoint((Math.PI + spread) / 2, radius, displacement)
    const endPoint = (radius, displacement) =>
      normalPoint(-(Math.PI + spread) / 2, radius, displacement)

    this.outline = function() {
      const inner = loopRadius - shaftRadius
      const outer = loopRadius + shaftRadius
      return [
        'M',
        startPoint(r1, shaftRadius),
        'L',
        startPoint(r3, shaftRadius),
        'A',
        outer,
        outer,
        0,
        1,
        1,
        endPoint(r3, shaftRadius),
        'L',
        endPoint(r2, shaftRadius),
        'L',
        endPoint(r2, -headWidth / 2),
        'L',
        endPoint(r1, 0),
        'L',
        endPoint(r2, headWidth / 2),
        'L',
        endPoint(r2, -shaftRadius),
        'L',
        endPoint(r3, -shaftRadius),
        'A',
        inner,
        inner,
        0,
        1,
        0,
        startPoint(r3, -shaftRadius),
        'L',
        startPoint(r1, -shaftRadius),
        'Z'
      ].join(' ')
    }

    this.overlay = function(minWidth) {
      const displacement = Math.max(minWidth / 2, shaftRadius)
      const inner = loopRadius - displacement
      const outer = loopRadius + displacement
      return [
        'M',
        startPoint(r1, displacement),
        'L',
        startPoint(r3, displacement),
        'A',
        outer,
        outer,
        0,
        1,
        1,
        endPoint(r3, displacement),
        'L',
        endPoint(r2, displacement),
        'L',
        endPoint(r2, -displacement),
        'L',
        endPoint(r3, -displacement),
        'A',
        inner,
        inner,
        0,
        1,
        0,
        startPoint(r3, -displacement),
        'L',
        startPoint(r1, -displacement),
        'Z'
      ].join(' ')
    }
  }
}
