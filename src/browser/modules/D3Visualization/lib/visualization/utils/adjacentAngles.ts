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
import AngleList from './angleList'

export type Run = { start: number; end: number }

export default class AdjacentAngles {
  findRuns(angleList: AngleList, minSeparation: number): Run[] {
    let p = 0
    let start = 0
    let end = 0
    const runs: Run[] = []
    const minStart = function () {
      if (runs.length === 0) {
        return 0
      } else {
        return runs[0].start
      }
    }

    const scanForDensePair = function () {
      start = p
      end = angleList.wrapIndex(p + 1)
      if (end === minStart()) {
        return 'done'
      } else {
        p = end
        if (tooDense(start, end)) {
          return extendEnd
        } else {
          return scanForDensePair
        }
      }
    }

    const extendEnd = function () {
      if (p === minStart()) {
        return 'done'
      } else if (tooDense(start, angleList.wrapIndex(p + 1))) {
        end = angleList.wrapIndex(p + 1)
        p = end
        return extendEnd
      } else {
        p = start
        return extendStart
      }
    }

    const extendStart = function () {
      const candidateStart = angleList.wrapIndex(p - 1)
      if (tooDense(candidateStart, end) && candidateStart !== end) {
        start = candidateStart
        p = start
        return extendStart
      } else {
        runs.push({
          start,
          end
        })
        p = end
        return scanForDensePair
      }
    }

    const tooDense = function (start: number, end: number) {
      const run = {
        start,
        end
      }
      return angleList.angle(run) < angleList.length(run) * minSeparation
    }

    // Recursive function that's hard to properly type
    let step: 'done' | (() => any) = scanForDensePair

    let stepCount = 0
    while (step !== 'done') {
      if (stepCount++ > angleList.totalLength() * 10) {
        console.log(
          'Warning: failed to layout arrows',
          Object.entries(angleList)
            .map(([key, value]) => `${key}: ${value.angle}`)
            .join('\n'),
          minSeparation
        )
        break
      }
      step = step()
    }

    return runs
  }
}
