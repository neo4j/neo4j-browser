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

const csvDelimiter = ','
const csvNewline = '\n'

const csvEscape = str => {
  if (!isString(str)) return str
  if (isEmptyString(str)) return '""'
  if (hasQuotes(str) || hasDelimiterChars(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
const serializeObject = input =>
  isObject(input) ? JSON.stringify(input) : input

const hasDelimiterChars = str => str && str.indexOf(csvDelimiter) > -1
const hasQuotes = str => str && str.indexOf('"') > -1
const isString = str => typeof str === 'string'
const isObject = str => typeof str === 'object' && str !== null
const isEmpty = str => typeof str === 'undefined' || str === null
const isEmptyString = str => str === ''

const csvChain = input =>
  (Array.isArray(input) ? input : [])
    .map(serializeObject)
    .map(csvEscape)
    .join(csvDelimiter)

export const CSVSerializer = cols => {
  const _cols = cols
  const _data = []
  const append = row => {
    const emptyRowInOneCol = isEmpty(row) && _cols.length === 1
    if (emptyRowInOneCol) return _data.push(row)
    if (!row || row.length !== _cols.length) {
      throw new Error('Column number mismatch')
    }
    _data.push(row)
  }
  return {
    append,
    appendRows: rows => rows.forEach(append),
    output: () =>
      csvChain(_cols) +
      (!_data.length ? '' : csvNewline + _data.map(csvChain).join(csvNewline))
  }
}
