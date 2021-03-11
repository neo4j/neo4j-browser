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

interface SimpleToken {
  val: string
}

interface FunctionToken extends SimpleToken {
  signature: string
}

export const toValueWithColonPrefix = ({ val }: SimpleToken): string =>
  `:${val}`

export const toValue = ({ val }: SimpleToken): string => val

export const toFunctionSchema = ({
  val,
  signature
}: FunctionToken): FunctionSchema => ({
  name: val,
  signature: signature.replace(val, '')
})

export const toProcedureSchema = (
  procedure: FunctionToken
): ProcedureSchema => {
  const signature = procedure.signature.replace(procedure.val, '')
  const matches = signature.match(/\([^)]*\) :: \((.*)\)/i)

  const returnItems = matches
    ? matches[1]
        .split(', ')
        .map((items: string) => items.match(/(.*) :: (.*)/))
        .filter((match): match is RegExpMatchArray => match !== null)
        .map(([, name, signature]) => ({ name, signature }))
    : []

  return {
    name: procedure.val,
    signature,
    returnItems
  }
}
