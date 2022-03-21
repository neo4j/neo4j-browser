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
import { FunctionSchema, ProcedureSchema } from 'cypher-editor-support'

export function toLabel(label: { val: string }): string {
  return `:${label.val}`
}

export function toRelationshipType(relationshipType: { val: string }): string {
  return `:${relationshipType.val}`
}

export function toPropertyKey(propertyKey: { val: string }): string {
  return propertyKey.val
}

export function toFunction(func: {
  val: string
  signature: string
}): FunctionSchema {
  return {
    name: func.val,
    signature: func.signature.replace(func.val, '')
  }
}
export function toProcedure(procedure: {
  val: string
  signature: string
}): ProcedureSchema {
  const name = procedure.val
  const signature = procedure.signature.replace(procedure.val, '')

  let returnItems: FunctionSchema[] = []
  const matches = signature.match(/\([^)]*\) :: \((.*)\)/i)
  if (matches) {
    returnItems = matches[1].split(', ').map(returnItem => {
      const returnItemMatches = returnItem.match(/(.*) :: (.*)/)
      return {
        name: returnItemMatches![1],
        signature: returnItemMatches![2]
      }
    })
  }

  return {
    name,
    signature,
    returnItems
  }
}
