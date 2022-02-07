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
import { Action, AnyAction } from 'redux'

import { ROUTED_WRITE_CONNECTION } from './boltConnection'
import { recursivelyTypeGraphItems } from './boltMappings'

export const RUN_CYPHER_MESSAGE = 'RUN_CYPHER_MESSAGE'
export const CANCEL_TRANSACTION_MESSAGE = 'CANCEL_TRANSACTION_MESSAGE'
export const CYPHER_ERROR_MESSAGE = 'CYPHER_ERROR_MESSAGE'
export const CYPHER_RESPONSE_MESSAGE = 'CYPHER_RESPONSE_MESSAGE'
export const POST_CANCEL_TRANSACTION_MESSAGE = 'POST_CANCEL_TRANSACTION_MESSAGE'
export const BOLT_CONNECTION_ERROR_MESSAGE = 'BOLT_CONNECTION_ERROR_MESSAGE'
export const CLOSE_CONNECTION_MESSAGE = 'CLOSE_CONNECTION_MESSAGE'

export const getWorkerPayloadForRunningCypherMessage = (
  input: string,
  parameters: unknown,
  connectionType = ROUTED_WRITE_CONNECTION,
  requestId = null,
  cancelable = false,
  connectionProperties: unknown
): AnyAction => {
  return {
    type: RUN_CYPHER_MESSAGE,
    input,
    parameters,
    connectionType,
    requestId,
    cancelable,
    connectionProperties
  }
}

export const cancelTransactionMessage = (id: string): AnyAction => {
  return {
    type: CANCEL_TRANSACTION_MESSAGE,
    id
  }
}

export const cypherResponseMessage = (result: unknown): AnyAction => {
  return {
    type: CYPHER_RESPONSE_MESSAGE,
    result: recursivelyTypeGraphItems(result)
  }
}

export const cypherErrorMessage = (error: {
  code: number
  message: string
}): AnyAction => {
  return {
    type: CYPHER_ERROR_MESSAGE,
    error
  }
}

export const postCancelTransactionMessage = (): Action => {
  return {
    type: POST_CANCEL_TRANSACTION_MESSAGE
  }
}

export const boltConnectionErrorMessage = (error: {
  code: string
  message: string
}): AnyAction => {
  return {
    type: BOLT_CONNECTION_ERROR_MESSAGE,
    error
  }
}

export const closeConnectionMessage = (): Action => ({
  type: CLOSE_CONNECTION_MESSAGE
})
