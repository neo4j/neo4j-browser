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
import { QueryResult, types } from 'neo4j-driver'

import { applyGraphTypes } from './boltMappings'
import {
  BOLT_CONNECTION_ERROR_MESSAGE,
  CYPHER_ERROR_MESSAGE,
  CYPHER_RESPONSE_MESSAGE,
  POST_CANCEL_TRANSACTION_MESSAGE
} from './boltWorkerMessages'
import WorkPool from 'services/WorkPool'

export const setupBoltWorker = (
  boltWorkPool: WorkPool,
  id: string,
  payload: any,
  onLostConnection: (error: Error) => void = (): void => undefined
): Promise<QueryResult> => {
  const workerPromise = new Promise<QueryResult>((resolve, reject) => {
    const work = boltWorkPool.doWork({
      id,
      payload,
      onmessage: ({ data }) => {
        switch (data.type) {
          case BOLT_CONNECTION_ERROR_MESSAGE:
            boltWorkPool.finishWork(work.id)
            onLostConnection(data.error)
            reject(data.error)
            break
          case CYPHER_ERROR_MESSAGE:
            boltWorkPool.finishWork(work.id)
            reject(data.error)
            break
          case CYPHER_RESPONSE_MESSAGE:
            boltWorkPool.finishWork(work.id)
            resolve(addTypesAsField(data.result))
            break
          case POST_CANCEL_TRANSACTION_MESSAGE:
            boltWorkPool.finishWork(work.id)
            break
          default:
            return
        }
      }
    })
  })
  return workerPromise
}

export const addTypesAsField = (result: QueryResult): QueryResult => {
  const records = result.records.map((record: any) => {
    const typedRecord = new (types.Record as any)(
      record.keys,
      record._fields,
      record._fieldLookup
    )
    if (typedRecord._fields) {
      typedRecord._fields = applyGraphTypes(typedRecord._fields)
    }
    return typedRecord
  })
  const summary = applyGraphTypes(result.summary)
  return { summary, records }
}
