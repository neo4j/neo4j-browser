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

import {
  Duration,
  isInt,
  Point,
  isDuration,
  isDate,
  isDateTime,
  isLocalDateTime,
  isLocalTime,
  isPoint,
  isTime,
  types
} from 'neo4j-driver-core'
import { Duration as luxonDuration } from 'luxon'
import { CypherProperty } from '../types/cypherDataTypes'

const getDriverTypeName = (val: CypherProperty) => {
  const driverTypeMap = types
  const driverTypes = Object.keys(types)
  for (const type of driverTypes) {
    if (val instanceof (driverTypeMap as any)[type]) {
      return type
    }
  }
  return undefined
}

const upperFirst = (str: string): string => str[0].toUpperCase() + str.slice(1)

export const getPropertyTypeDisplayName = (val: CypherProperty): string => {
  const jsType = typeof val
  const complexType = jsType === 'object'

  if (jsType === 'number') {
    return 'Float'
  }

  if (!complexType) {
    return upperFirst(jsType)
  }

  if (val instanceof Array) {
    if (val.length > 0) {
      // Lists in properties are only allowed to contain a single type
      return `List<${getPropertyTypeDisplayName(val[0])}>(${val.length})`
    } else {
      return `List(${val.length})`
    }
  }

  if (val === null) {
    return 'null'
  }

  return getDriverTypeName(val) || 'Unknown'
}

export function propertyToString(property: CypherProperty): string {
  if (Array.isArray(property)) {
    return `[${property.map(propertyToString).join(', ')}]`
  }
  if (property === null) {
    return 'null'
  }
  if (typeof property === 'boolean') {
    return property.toString()
  }
  if (isInt(property)) {
    return property.toString()
  }
  if (typeof property === 'bigint') {
    return property.toString()
  }
  if (typeof property === 'number') {
    return numberFormat(property)
  }
  if (typeof property === 'string') {
    return property
  }

  if (property.constructor === Int8Array) {
    return 'ByteArray'
  }

  if (
    [isDate, isTime, isDateTime, isLocalTime, isLocalDateTime].some(tester =>
      tester(property)
    )
  ) {
    return `"${property.toString()}"`
  }

  if (isDuration(property)) {
    return durationFormat(property)
  }
  if (isPoint(property)) {
    return spacialFormat(property)
  }

  // This case shouldn't be used, but added as a fallback
  return String(property)
}

const durationFormat = (duration: Duration): string =>
  luxonDuration
    .fromISO(duration.toString())
    .shiftTo('years', 'days', 'months', 'hours', 'minutes', 'seconds')
    .normalize()
    .toISO()

const numberFormat = (anything: number) => {
  // Exclude false positives and return early
  if ([Infinity, -Infinity, NaN].includes(anything)) {
    return `${anything}`
  }
  return `${anything}.0`
}

const spacialFormat = (anything: Point): string => {
  const zString = anything.z !== undefined ? `, z:${anything.z}` : ''
  return `point({srid:${anything.srid}, x:${anything.x}, y:${anything.y}${zString}})`
}
