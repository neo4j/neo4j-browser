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
/* eslint-env serviceworker */
import 'core-js/stable'
import { BoltConnectionError, createErrorObject } from '../exceptions'
import {
  ensureConnection,
  closeConnection,
  DIRECT_CONNECTION,
  ROUTED_WRITE_CONNECTION,
  ROUTED_READ_CONNECTION
} from './boltConnection'
import {
  routedWriteTransaction,
  cancelTransaction,
  routedReadTransaction,
  directTransaction
} from './transactions'
import {
  cypherErrorMessage,
  cypherResponseMessage,
  postCancelTransactionMessage,
  boltConnectionErrorMessage,
  RUN_CYPHER_MESSAGE,
  CANCEL_TRANSACTION_MESSAGE,
  CLOSE_CONNECTION_MESSAGE
} from './boltWorkerMessages'
import { applyGraphTypes } from 'services/bolt/boltMappings'

const connectionTypeMap: any = {
  [ROUTED_WRITE_CONNECTION]: {
    create: routedWriteTransaction,
    getPromise: (res: any) => res[1]
  },
  [ROUTED_READ_CONNECTION]: {
    create: routedReadTransaction,
    getPromise: (res: any) => res
  },
  [DIRECT_CONNECTION]: {
    create: directTransaction,
    getPromise: (res: any) => res
  }
}

let busy = false
const workQue: any = []

const onmessage = function(message: any) {
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
    beforeWork()
    const { txMetadata, useDb, autoCommit } = connectionProperties
    ensureConnection(connectionProperties, connectionProperties.opts, () => {
      ;(self as any).postMessage(
        boltConnectionErrorMessage(createErrorObject(BoltConnectionError))
      )
    })
      .then(() => {
        const res = connectionTypeMap[connectionType].create(
          input,
          applyGraphTypes(parameters),
          { requestId, cancelable, txMetadata, useDb, autoCommit }
        )
        connectionTypeMap[connectionType]
          .getPromise(res)
          .then((r: any) => {
            afterWork()
            ;(self as any).postMessage(cypherResponseMessage(r))
          })
          .catch((e: any) => {
            afterWork()
            ;(self as any).postMessage(
              cypherErrorMessage({ code: e.code, message: e.message })
            )
          })
      })
      .catch(e => {
        afterWork()
        ;(self as any).postMessage(
          cypherErrorMessage({ code: e.code, message: e.message })
        )
      })
  } else if (messageType === CANCEL_TRANSACTION_MESSAGE) {
    cancelTransaction(message.data.id, () => {
      ;(self as any).postMessage(postCancelTransactionMessage())
    })
  } else if (messageType === CLOSE_CONNECTION_MESSAGE) {
    queueWork(() => {
      closeConnection()
    })
  } else {
    ;(self as any).postMessage(
      cypherErrorMessage({
        code: -1,
        message: `Unknown message to Bolt Worker: ${messageType}`
      })
    )
  }
}

const beforeWork = () => {
  busy = true
}

const afterWork = () => {
  busy = false
  doWork()
}

const queueWork = (fn: any) => {
  workQue.push(fn)
  doWork()
}
const doWork = () => {
  if (busy) {
    return
  }
  if (!workQue.length) {
    return
  }
  const workFn = workQue.shift()
  workFn()
  doWork()
}

self.addEventListener('message', onmessage)
