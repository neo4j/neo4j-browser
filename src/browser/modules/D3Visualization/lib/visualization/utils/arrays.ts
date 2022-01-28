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

export function isNullish(x: unknown): x is null | undefined {
  return x === null || x === undefined
}

export function min<T>(list: Array<T>, accessor?: (item: T) => number): number {
  const values = list
    .map(accessor ?? Number)
    .filter(n => !(isNullish(n) || isNaN(n)))

  return Math.min(...values)
}

export function max<T>(list: Array<T>, accessor?: (item: T) => number): number {
  const values = list
    .map(accessor ?? Number)
    .filter(n => !(isNullish(n) || isNaN(n)))

  return Math.max(...values)
}

export function sum<T>(list: Array<T>, accessor?: (item: T) => number): number {
  return list.map(accessor ?? Number).reduce((sum, curr) => {
    if (isNullish(curr) || isNaN(curr)) {
      return sum
    }

    return sum + curr
  }, 0)
}

export function groupBy<T>(
  list: Array<T>,
  group: (item: T) => number | string
): Record<string, Array<T>> {
  return list.reduce((groups, item) => {
    const key = group(item)

    if (groups[key]) {
      groups[key].push(item)
    } else {
      groups[key] = [item]
    }

    return groups
  }, {} as Record<string, Array<T>>)
}
