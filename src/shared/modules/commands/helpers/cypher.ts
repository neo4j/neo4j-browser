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
import { QueryResult } from 'neo4j-driver'

import bolt from 'services/bolt/bolt'
import { applyGraphTypes } from 'services/bolt/boltMappings'
import { arrayToObject } from 'services/utils'
import { send } from 'shared/modules/requests/requestsDuck'
import { v4 } from 'uuid'

export const applyParamGraphTypes = (params = {} as any) =>
  arrayToObject(
    Object.keys(params).map(k => ({
      [k]: applyGraphTypes(params[k])
    }))
  )

export const handleCypherCommand = (
  action: any,
  put: any,
  params = {} as any,
  txMetadata = {},
  autoCommit = false
): [string, Promise<QueryResult>] => {
  const parameters = applyParamGraphTypes(params)
  const requestMetaData = {
    requestId: action.requestId || v4(),
    cancelable: true,
    ...txMetadata,
    autoCommit,
    useDb: action.useDb
  }

  const id = requestMetaData.requestId
  const request = action.useReadTransaction
    ? bolt.routedReadTransaction(action.query, parameters, requestMetaData)
    : bolt.routedWriteTransaction(action.query, parameters, requestMetaData)[1]

  put(send(id))
  return [id, request]
}
