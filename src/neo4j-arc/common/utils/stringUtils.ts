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
export const upperFirst = (str: string): string =>
  str[0].toUpperCase() + str.slice(1)

export const toKeyString = (str: any) => btoa(encodeURIComponent(str))

export const numberToUSLocale = (
  value: null | undefined | number | string
): string | null => {
  if (value === null || value === undefined) {
    return null
  }

  const n = typeof value === 'number' ? value : parseInt(value, 10)
  if (isNaN(n)) {
    return n.toString()
  }

  return n.toLocaleString('en-US')
}
