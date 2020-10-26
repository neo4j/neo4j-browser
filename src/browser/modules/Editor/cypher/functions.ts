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

// https://neo4j.com/docs/cypher-manual/current/functions/
/**
 * Signature syntax examples:
 * - (name :: TYPE?, name = default :: INTEGER?) :: VOID
 * - () :: (TYPE?)
 */
function func(name, signature) {
  return { name, signature }
}

export const predicate = [
  func('all', '(variable IN list WHERE predicate :: ANY) :: (BOOLEAN)'),
  func('any', '(variable IN list WHERE predicate :: ANY) :: (BOOLEAN)'),
  func('exists', '(property|pattern :: ANY) :: (BOOLEAN)'),
  func('none', '(variable in list WHERE predicate :: ANY) :: (BOOLEAN)'),
  func('single', '(variable in list WHERE predicate :: ANY) :: (BOOLEAN)')
]

export const shortestPath = [
  func('shortestPath', '(pattern :: PATH) :: (PATH)'),
  func('allShortestPaths', '(pattern :: PATH) :: (LIST OF PATH)')
]

export const scalar = [
  func('coalesce', '(expression... :: ANY) :: (ANY)'),
  func('endNode', '(relationship :: RELATIONSHIP) :: (NODE)'),
  func('head', '(expression :: LIST OF ANY) :: (ANY)'),
  func('id', '(node :: NODE) :: (INTEGER)'),
  func('id', '(relationship :: RELATIONSHIP) :: (INTEGER)'),
  func('last', '(expression :: LIST OF ANY) :: (ANY)'),
  func('length', '(path :: ANY) :: (INTEGER)'),
  func('length', '(string :: STRING) :: (INTEGER)'),
  func('properties', '(entity :: ENTITY) :: (MAP)'),
  func('size', '(list :: LIST OF ANY) :: (INTEGER)'),
  func('size', '(pattern :: PATTERN) :: (INTEGER)'),
  func('startNode', '(relationship :: RELATIONSHIP) :: (NODE)'),
  func('timestamp', '() :: (INTEGER)'),
  func('toBoolean', '(expression :: STRING) :: (BOOLEAN)'),
  func('toFloat', '(expression :: STRING) :: (FLOAT)'),
  func('toInteger', '(expression :: STRING) :: (INTEGER)'),
  func('type', '(relationship :: RELATIONSHIP) :: (STRING)')
]

export const aggregation = [
  func('avg', '(expression :: NUMBER) :: (FLOAT)'),
  func('collect', '(expression :: ANY) :: (LIST OF ANY)'),
  func('count', '(expression :: ANY) :: (INTEGER)'),
  func('max', '(expression :: NUMBER) :: (NUMBER)'),
  func('min', '(expression :: NUMBER) :: (NUMBER)'),
  func(
    'percentileCont',
    '(expression :: NUMBER, percentile :: FLOAT) :: (FLOAT)'
  ),
  func(
    'percentileDisc',
    '(expression :: NUMBER, percentile :: FLOAT) :: (NUMBER)'
  ),
  func('stDev', '(expression :: NUMBER) :: (FLOAT)'),
  func('stDevP', '(expression :: NUMBER) :: (FLOAT)'),
  func('sum', '(expression :: NUMBER) :: (NUMBER)')
]

export const list = [
  func('extract', '(variable IN list | expression :: ANY) :: (LIST OF ANY)'),
  func('filter', '(variable IN list WHERE predicate :: ANY) :: (LIST OF ANY)'),
  func('keys', '(node :: NODE) :: (LIST OF STRING)'),
  func('keys', '(relationship :: RELATIONSHIP) :: (LIST OF STRING)'),
  func('labels', '(node :: NODE) :: (LIST OF STRING)'),
  func('nodes', '(path :: PATH) :: (LIST OF NODE)'),
  func(
    'range',
    '(start :: INTEGER, end :: INTEGER, step = 1 :: INTEGER) :: (LIST OF INTEGER)'
  ),
  func(
    'reduce',
    '(accumulator = initial :: ANY, variable IN list | expression :: ANY) :: (ANY)'
  ),
  func('relationships', '(path :: PATH) :: (LIST OF RELATIONSHIP)'),
  func('rels', '(path :: PATH) :: (LIST OF RELATIONSHIP)'),
  func('tail', '(expression :: LIST OF ANY) :: (LIST OF ANY)')
]

export const mathematicNumeric = [
  func('abs', '(expression :: NUMBER) :: (INTEGER)'),
  func('ceil', '(expression :: NUMBER) :: (INTEGER)'),
  func('floor', '(expression :: NUMBER) :: (INTEGER)'),
  func('rand', '() :: (FLOAT)'),
  func('round', '(expression :: NUMBER) :: (INTEGER)'),
  func('sign', '(expression :: NUMBER) :: (INTEGER)')
]

export const mathematicLogarithmic = [
  func('e', '() :: (FLOAT)'),
  func('exp', '(expression :: NUMBER) :: (FLOAT)'),
  func('log', '(expression :: NUMBER) :: (FLOAT)'),
  func('log10', '(expression :: NUMBER) :: (FLOAT)'),
  func('sqrt', '(expression :: NUMBER) :: (FLOAT)')
]

export const mathematicTrigonometric = [
  func('acos', '(expression :: NUMBER) :: (FLOAT)'),
  func('asin', '(expression :: NUMBER) :: (FLOAT)'),
  func('atan', '(expression :: NUMBER) :: (FLOAT)'),
  func('atan2', '(expression :: NUMBER, expression :: NUMBER) :: (FLOAT)'),
  func('cos', '(expression :: NUMBER) :: (FLOAT)'),
  func('cot', '(expression :: NUMBER) :: (FLOAT)'),
  func('degrees', '(expression :: NUMBER) :: (FLOAT)'),
  func('haversin', '(expression :: NUMBER) :: (FLOAT)'),
  func('pi', '() :: (FLOAT)'),
  func('radians', '(expression :: NUMBER) :: (FLOAT)'),
  func('sin', '(expression :: NUMBER) :: (FLOAT)'),
  func('tan', '(expression :: NUMBER) :: (FLOAT)')
]

export const string = [
  func('left', '(original :: STRING, length :: INTEGER) :: (STRING)'),
  func('lTrim', '(original :: STRING) :: (STRING)'),
  func(
    'replace',
    '(original :: STRING, search :: STRING, replace :: STRING) :: (STRING)'
  ),
  func('reverse', '(original :: STRING) :: (STRING)'),
  func('right', '(original :: STRING, length :: INTEGER) :: (STRING)'),
  func('rTrim', '(original :: STRING) :: (STRING)'),
  func(
    'split',
    '(original :: STRING, splitPattern :: STRING) :: (LIST OF STRING)'
  ),
  func(
    'substring',
    '(original :: STRING, start :: INTEGER, length = length(original) :: INTEGER) :: (STRING)'
  ),
  func('toLower', '(original :: STRING) :: (STRING)'),
  func('toString', '(expression :: ANY) :: (STRING)'),
  func('toUpper', '(original :: STRING) :: (STRING)'),
  func('trim', '(original :: STRING) :: (STRING)')
]

export const spatial = [
  func('distance', '(point1 :: POINT, point2 :: POINT) :: (NUMBER)'),
  func('point', '({longitude | x, latitude | y [, crs]} :: MAP) :: (POINT)'),
  func('point', '({x, y [, crs]} :: MAP) :: (POINT)')
]

export default [
  ...predicate,
  ...shortestPath,
  ...scalar,
  ...aggregation,
  ...list,
  ...mathematicNumeric,
  ...mathematicLogarithmic,
  ...mathematicTrigonometric,
  ...string,
  ...spatial
]
