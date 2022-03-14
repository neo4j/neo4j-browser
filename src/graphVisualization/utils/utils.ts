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

export function optionalToString(value: any) {
  return !isNullish(value) && typeof value?.toString === 'function'
    ? value.toString()
    : value
}

export const selectorStringToArray = (selector: string) => {
  // Negative lookbehind simulation since js support is very limited.
  // We want to match all . that are not preceded by \\
  // Instead we reverse and look
  // for . that are not followed by \\ (negative lookahead)
  const reverseSelector = selector.split('').reverse().join('')
  const re = /(.+?)(?!\.\\)(?:\.|$)/g
  const out = []
  let m
  while ((m = re.exec(reverseSelector)) !== null) {
    const res = m[1].split('').reverse().join('')
    out.push(res)
  }

  return out
    .filter(r => r)
    .reverse()
    .map(r => r.replace(/\\./g, '.'))
}

export const selectorArrayToString = (selectors: any) => {
  const escaped = selectors.map((r: any) => r.replace(/\./g, '\\.'))
  return escaped.join('.')
}
