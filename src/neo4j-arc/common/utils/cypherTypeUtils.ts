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

import { isInt, Point, isPoint, types } from 'neo4j-driver-core'
import {
  CypherDataType,
  CypherProperty,
  isCypherPropertyType,
  isCypherTemporalType
} from '../types/cypherDataTypes'

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

export const cypherDataToString = (map: CypherDataType): string => {
  const recursiveStringify = (
    value: CypherDataType,
    indentationLevel = 0
  ): string => {
    const indentation = '  '.repeat(indentationLevel)

    const nextIndentationLevel = indentationLevel + 1
    const nextIdentation = '  '.repeat(nextIndentationLevel)

    if (isCypherPropertyType(value)) {
      return propertyToString(value)
    }

    if (Array.isArray(value)) {
      return `[
${value
  .map(v => `${nextIdentation}${recursiveStringify(v, nextIndentationLevel)}`)
  .join(',\n')}\n${indentation}]`
    }

    // Now we have nodes, relationships, paths and cypher maps left.
    // No special care for them stringify them as we would normal objects
    const entries = Object.entries(value)
    if (entries.length === 0) return '{}'

    return `{
${entries
  .map(([key, val]) => {
    return `${nextIdentation}${key}: ${recursiveStringify(
      val,
      nextIndentationLevel
    )}`
  })
  .join(',\n')}
${indentation}}`
  }

  return recursiveStringify(map)
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
    return `"${property}"`
  }

  if (property.constructor === Int8Array) {
    return 'ByteArray'
  }

  if (isCypherTemporalType(property)) {
    return property.toString()
  }

  if (isPoint(property)) {
    return spacialFormat(property)
  }

  // This case shouldn't be used, but added as a fallback
  return String(property)
}

const numberFormat = (anything: number) => {
  // Exclude false positives and return early
  if ([Infinity, -Infinity, NaN].includes(anything)) {
    return `${anything}`
  }
  if (Math.floor(anything) === anything) {
    return `${anything}.0`
  }
  return anything.toString()
}

const spacialFormat = (anything: Point): string => {
  const zString = anything.z !== undefined ? `, z:${anything.z}` : ''
  return `point({srid:${anything.srid}, x:${anything.x}, y:${anything.y}${zString}})`
}
