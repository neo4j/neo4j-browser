/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { parseLambda } from '@neo4j/browser-lambda-parser'
import {
  assign,
  head,
  join,
  map,
  reduce,
  slice,
  split,
  tail,
  trim
} from 'lodash-es'

import bolt from '../../../services/bolt/bolt'
import { recursivelyTypeGraphItems } from '../../../services/bolt/boltMappings'
import { userDirectTxMetadata } from '../../../services/bolt/txMetadata'
import arrayHasItems from '../../../utils/array-has-items'

const FAT_ARROW = '=>'
const TOKEN = 'token'
const ARRAY = 'array'
const IMPLICIT = 'implicit'
const NEARLEY_ERROR_SPLIT =
  'Instead, I was expecting to see one of the following:'

export function parseLambdaStatement(lambda: any) {
  return Promise.resolve()
    .then(() => {
      const ast = parseLambda(trim(lambda))

      if (!arrayHasItems(ast)) {
        throw new Error(
          "Unrecognized input. Sorry we couldn't be more specific."
        )
      }

      const [
        {
          parameters,
          variant,
          body: { returnValues }
        }
      ] = ast
      const statement = trim(join(tail(split(lambda, FAT_ARROW)), FAT_ARROW))
      const query =
        variant === IMPLICIT
          ? `RETURN ${statement}`
          : statement.slice(1, statement.length - 1)

      return {
        parameters,
        query,
        variant,
        returnValues
      }
    })
    .catch(e => {
      throw new Error(head(split(e, NEARLEY_ERROR_SPLIT)))
    })
}

export async function collectLambdaValues(
  { parameters, query, variant }: any,
  requestId: any
) {
  const [_id, request] = bolt.routedWriteTransaction(
    query,
    {},
    {
      requestId,
      cancelable: false,
      ...userDirectTxMetadata
    }
  )

  const { records }: { records: any[] } = await request
  if (variant === IMPLICIT) {
    const firstResult: any = head(records)

    return firstResult
      ? recursivelyTypeGraphItems({
          [parameters.value]: firstResult.get(head(firstResult.keys))
        })
      : {}
  }

  if (parameters.type === TOKEN) {
    const extractedRecords = map(records, record =>
      reduce(
        record.keys,
        (agg, next) =>
          assign(agg, {
            [next]: record.get(next)
          }),
        {}
      )
    )

    return {
      [parameters.value]: map(extractedRecords, record =>
        recursivelyTypeGraphItems(record)
      )
    }
  }

  // future proofing
  if (parameters.type !== ARRAY) return {}

  const { items } = parameters
  const extractedRecords = map(
    slice(records, 0, items.length),
    (record, index) => {
      const item = items[index]
      const keys = item.type === TOKEN ? [item] : item.keys // item.type === OBJECT

      return reduce(
        keys,
        (agg, next) =>
          assign(agg, {
            [next.alias || next.value]: record.get(next.value)
          }),
        {}
      )
    }
  )

  return reduce(
    extractedRecords,
    (agg, record) => assign(agg, recursivelyTypeGraphItems(record)),
    {}
  )
}
