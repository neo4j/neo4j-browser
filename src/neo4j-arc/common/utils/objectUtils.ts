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
export const deepEquals = (x: any, y: any): boolean => {
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    if (Object.keys(x).length !== Object.keys(y).length) return false
    return Object.keys(x).every(key => deepEquals(x[key], y[key]))
  }
  if (typeof x === 'function' && typeof y === 'function') {
    return x.toString() === y.toString()
  }
  return x === y
}
export function mapObjectValues<A, B>(
  object: Record<string, A>,
  mapper: (val: A) => B
): Record<string, B> {
  return Object.entries(object).reduce(
    (res: Record<string, B>, [currKey, currVal]) => {
      res[currKey] = mapper(currVal)
      return res
    },
    {}
  )
}

export function keys<T>(object: T): Array<keyof T> {
  return Object.keys(object) as Array<keyof T>
}
