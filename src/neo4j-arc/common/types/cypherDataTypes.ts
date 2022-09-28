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
  Date,
  DateTime,
  Duration,
  Integer,
  isDate,
  isDateTime,
  isDuration,
  isInt,
  isLocalDateTime,
  isLocalTime,
  isPoint,
  isTime,
  LocalDateTime,
  LocalTime,
  Path,
  Point,
  Node,
  Relationship,
  Time
} from 'neo4j-driver-core'

/** 
      The neo4j driver type mapping - https://neo4j.com/docs/javascript-manual/current/cypher-workflow/#js-driver-type-mapping
      
      Star denotes custom driver class.
      
      Cypher(neo4j) -  Driver type(js)
      null          - null
      List          - array
      Map           - Object
      Boolean       - boolean
      Integer       - Integer*
      Float         - number
      String        - string
      ByteArray     - Int8Array
      Date          - Date*
      Time          - Time*
      LocalTime     - LocalTime*
      DateTime      - DateTime*
      LocalDateTime - LocalDateTime*
      Duration      - Duration*
      Point         - Point*
      Node          - Node*
      Relationship  - Relationship*
      Path          - Path*
      */

export type CypherBasicPropertyType =
  | null
  | boolean
  | number
  | string
  | Integer
  | BigInt
  | Int8Array
  | CypherTemporalType
  | Point

export type CypherTemporalType =
  | Date
  | Time
  | DateTime
  | LocalTime
  | LocalDateTime
  | Duration

// Lists are also allowed as property types, as long as all items are the same basic type
export type CypherProperty = CypherBasicPropertyType | CypherBasicPropertyType[]

// CypherStructuralType can NOT be used as property or parameter
export type CypherStructuralType = Node | Relationship | Path

// Maps & lists CAN be used as parameters but not as properties with the exception that list if all it's items are the same CypherBasicPropertyType
export type CypherList = (
  | CypherBasicPropertyType
  | CypherStructuralType
  | CypherMap
  | CypherList
)[]

export interface CypherMap {
  [key: string]:
    | CypherBasicPropertyType
    | CypherStructuralType
    | CypherMap
    | CypherList
}

export type CypherDataType =
  | CypherBasicPropertyType
  | CypherStructuralType
  | CypherMap
  | CypherList

export const isCypherBasicPropertyType = (
  value: any
): value is CypherBasicPropertyType => {
  const valType = typeof value

  return (
    value === null ||
    valType === 'boolean' ||
    valType === 'string' ||
    valType === 'number' ||
    valType === 'bigint' ||
    value.constructor === Int8Array ||
    isInt(value) ||
    isCypherTemporalType(value) ||
    isPoint(value)
  )
}
export const isCypherPropertyType = (value: any): value is CypherProperty => {
  if (Array.isArray(value)) {
    if (value.length === 0) return true

    return isCypherBasicPropertyType(value[0])
  } else {
    return isCypherBasicPropertyType(value)
  }
}

export const isCypherTemporalType = (
  anything: object
): anything is CypherTemporalType =>
  [isDate, isTime, isDateTime, isLocalTime, isLocalDateTime, isDuration].some(
    tester => tester(anything)
  )
