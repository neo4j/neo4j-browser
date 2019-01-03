/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
/* eslint-env serviceworker */
import '@babel/polyfill'
import { BoltConnectionError, createErrorObject } from '../exceptions'
import {
  ensureConnection,
  routedWriteTransaction,
  cancelTransaction,
  closeConnection,
  routedReadTransaction,
  directTransaction,
  DIRECT_CONNECTION,
  ROUTED_WRITE_CONNECTION,
  ROUTED_READ_CONNECTION
} from './boltConnection'
import {
  cypherErrorMessage,
  cypherResponseMessage,
  postCancelTransactionMessage,
  boltConnectionErrorMessage,
  RUN_CYPHER_MESSAGE,
  CANCEL_TRANSACTION_MESSAGE
} from './boltWorkerMessages'
import { applyGraphTypes } from 'services/bolt/boltMappings'

const connectionTypeMap = {
  [ROUTED_WRITE_CONNECTION]: {
    create: routedWriteTransaction,
    getPromise: res => res[1]
  },
  [ROUTED_READ_CONNECTION]: {
    create: routedReadTransaction,
    getPromise: res => res
  },
  [DIRECT_CONNECTION]: { create: directTransaction, getPromise: res => res }
}

const onmessage = function (message) {
  const messageType = message.data.type

  if (messageType === RUN_CYPHER_MESSAGE) {
    const {
      input,
      parameters,
      connectionType,
      requestId,
      cancelable,
      connectionProperties
    } = message.data
    const { txMetadata } = connectionProperties
    ensureConnection(connectionProperties, connectionProperties.opts, e => {
      self.postMessage(
        boltConnectionErrorMessage(createErrorObject(BoltConnectionError))
      )
    })
      .then(() => {
        const res = connectionTypeMap[connectionType].create(
          input,
          applyGraphTypes(parameters),
          requestId,
          cancelable,
          txMetadata
        )
        connectionTypeMap[connectionType]
          .getPromise(res)
          .then(r => {
            self.postMessage(cypherResponseMessage(r))
            closeConnection()
          })
          .catch(e => {
            self.postMessage(
              cypherErrorMessage({ code: e.code, message: e.message })
            )
            closeConnection()
          })
      })
      .catch(e => {
        self.postMessage(
          cypherErrorMessage({ code: e.code, message: e.message })
        )
      })
  } else if (messageType === CANCEL_TRANSACTION_MESSAGE) {
    cancelTransaction(message.data.id, () => {
      self.postMessage(postCancelTransactionMessage())
      closeConnection()
    })
  } else {
    self.postMessage(
      cypherErrorMessage({
        code: -1,
        message: `Unknown message to Bolt Worker: ${messageType}`
      })
    )
  }
}

self.addEventListener('message', onmessage)
