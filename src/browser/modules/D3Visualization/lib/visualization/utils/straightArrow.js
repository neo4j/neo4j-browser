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

export default class StraightArrow {
  deflection = 0

  constructor(
    startRadius,
    endRadius,
    centreDistance,
    shaftWidth,
    headWidth,
    headHeight,
    captionLayout
  ) {
    this.length = centreDistance - (startRadius + endRadius)

    this.shaftLength = this.length - headHeight
    const startArrow = startRadius
    const endShaft = startArrow + this.shaftLength
    const endArrow = startArrow + this.length
    const shaftRadius = shaftWidth / 2
    const headRadius = headWidth / 2

    this.midShaftPoint = {
      x: startArrow + this.shaftLength / 2,
      y: 0
    }

    this.outline = function(shortCaptionLength) {
      if (captionLayout === 'external') {
        const startBreak =
          startArrow + (this.shaftLength - shortCaptionLength) / 2
        const endBreak = endShaft - (this.shaftLength - shortCaptionLength) / 2

        return [
          'M',
          startArrow,
          shaftRadius,
          'L',
          startBreak,
          shaftRadius,
          'L',
          startBreak,
          -shaftRadius,
          'L',
          startArrow,
          -shaftRadius,
          'Z',
          'M',
          endBreak,
          shaftRadius,
          'L',
          endShaft,
          shaftRadius,
          'L',
          endShaft,
          headRadius,
          'L',
          endArrow,
          0,
          'L',
          endShaft,
          -headRadius,
          'L',
          endShaft,
          -shaftRadius,
          'L',
          endBreak,
          -shaftRadius,
          'Z'
        ].join(' ')
      } else {
        return [
          'M',
          startArrow,
          shaftRadius,
          'L',
          endShaft,
          shaftRadius,
          'L',
          endShaft,
          headRadius,
          'L',
          endArrow,
          0,
          'L',
          endShaft,
          -headRadius,
          'L',
          endShaft,
          -shaftRadius,
          'L',
          startArrow,
          -shaftRadius,
          'Z'
        ].join(' ')
      }
    }

    this.overlay = function(minWidth) {
      const radius = Math.max(minWidth / 2, shaftRadius)
      return [
        'M',
        startArrow,
        radius,
        'L',
        endArrow,
        radius,
        'L',
        endArrow,
        -radius,
        'L',
        startArrow,
        -radius,
        'Z'
      ].join(' ')
    }
  }
}
