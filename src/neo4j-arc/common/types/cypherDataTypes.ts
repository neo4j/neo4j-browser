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
  LocalDateTime,
  LocalTime,
  Path,
  Point,
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
  | Integer
  | BigInt
  | number
  | string
  | Int8Array
  | Date
  | Time
  | DateTime
  | LocalTime
  | LocalDateTime
  | Duration
  | Point

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
