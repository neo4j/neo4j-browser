/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import bolt from 'services/bolt/bolt'
import { applyGraphTypes } from 'services/bolt/boltMappings'
import { arrayToObject } from 'services/utils'
import { send } from 'shared/modules/requests/requestsDuck'

export const handleCypherCommand = (
  action,
  put,
  params = {},
  shouldUseCypherThread = false
) => {
  const paramsToNeo4jType = Object.keys(params).map(k => ({
    [k]: applyGraphTypes(params[k])
  }))
  const [id, request] = bolt.routedWriteTransaction(
    action.cmd,
    arrayToObject(paramsToNeo4jType),
    {
      useCypherThread: shouldUseCypherThread,
      requestId: action.requestId,
      cancelable: true
    }
  )
  put(send('cypher', id))
  return [id, request]
}
