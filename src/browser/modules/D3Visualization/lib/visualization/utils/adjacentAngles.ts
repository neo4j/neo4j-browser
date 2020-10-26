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

export default class AdjacentAngles {
  findRuns(AngleList, minSeparation) {
    let p = 0
    let start = 0
    let end = 0
    const runs = []
    const minStart = function() {
      if (runs.length === 0) {
        return 0
      } else {
        return runs[0].start
      }
    }

    const scanForDensePair = function() {
      start = p
      end = AngleList.wrapIndex(p + 1)
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

    const extendEnd = function() {
      if (p === minStart()) {
        return 'done'
      } else if (tooDense(start, AngleList.wrapIndex(p + 1))) {
        end = AngleList.wrapIndex(p + 1)
        p = end
        return extendEnd
      } else {
        p = start
        return extendStart
      }
    }

    const extendStart = function() {
      const candidateStart = AngleList.wrapIndex(p - 1)
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

    const tooDense = function(start, end) {
      const run = {
        start,
        end
      }
      return AngleList.angle(run) < AngleList.length(run) * minSeparation
    }

    let stepCount = 0
    let step = scanForDensePair
    while (step !== 'done') {
      if (stepCount++ > AngleList.totalLength() * 10) {
        console.log(
          'Warning: failed to layout arrows',
          (() => {
            const result = []
            for (const key of Object.keys(AngleList.list || {})) {
              const value = AngleList.list[key]
              result.push(`${key}: ${value.angle}`)
            }
            return result
          })().join('\n'),
          minSeparation
        )
        break
      }
      step = step()
    }

    return runs
  }
}
