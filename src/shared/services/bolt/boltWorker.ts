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
import { AnyAction } from 'redux'

import { BoltConnectionError } from '../exceptions'
import {
  DIRECT_CONNECTION,
  ROUTED_READ_CONNECTION,
  ROUTED_WRITE_CONNECTION,
  closeConnection,
  ensureConnection
} from './boltConnection'
import { isBoltConnectionErrorCode } from './boltConnectionErrors'
import {
  BOLT_CONNECTION_ERROR_MESSAGE,
  CANCEL_TRANSACTION_MESSAGE,
  CLOSE_CONNECTION_MESSAGE,
  RUN_CYPHER_MESSAGE,
  boltConnectionErrorMessage,
  cypherErrorMessage,
  cypherResponseMessage,
  postCancelTransactionMessage
} from './boltWorkerMessages'
import {
  cancelTransaction,
  directTransaction,
  routedReadTransaction,
  routedWriteTransaction
} from './transactions'
import { applyGraphTypes } from 'services/bolt/boltMappings'

declare const self: ServiceWorker
type WorkerMessage = {
  data: {
    cancelable: boolean
    connectionProperties: {
      txMetadata: unknown
      useDb: string
      autoCommit: boolean
      opts: Record<string, unknown>
      host: string
      username: string
      password: string
    }
    connectionType:
      | typeof DIRECT_CONNECTION
      | typeof ROUTED_READ_CONNECTION
      | typeof ROUTED_WRITE_CONNECTION
    id: string
    input: string
    parameters: unknown
    requestId: string
    type: string
  }
}

// Something strange is going on here and it could be causing a bug. ALL of the
// functions used here return an array `[string, Promise<any>]` WHEN they're
// creating a tracked transaction. But here we assume that ONLY
// routedWriteTransaction is ALWAYS returning an array.
const connectionTypeMap = {
  [ROUTED_WRITE_CONNECTION]: {
    create: routedWriteTransaction,
    getPromise: (res: Promise<unknown>[]): Promise<unknown> => res[1]
  },
  [ROUTED_READ_CONNECTION]: {
    create: routedReadTransaction,
    getPromise: (res: Promise<unknown>): Promise<unknown> => res
  },
  [DIRECT_CONNECTION]: {
    create: directTransaction,
    getPromise: (res: Promise<unknown>): Promise<unknown> => res
  }
}

let busy = false
const workQueue: { (): void }[] = []

const maybeCypherErrorMessage = (error: any): AnyAction | undefined => {
  if (isBoltConnectionErrorCode(error.code)) {
    return boltConnectionErrorMessage({
      ...error,
      type: BOLT_CONNECTION_ERROR_MESSAGE
    })
  } else {
    return cypherErrorMessage(error)
  }
}

const runCypherMessage = async (data: WorkerMessage['data']) => {
  const {
    input,
    parameters,
    connectionType,
    requestId,
    cancelable,
    connectionProperties
  } = data

  const { txMetadata, useDb, autoCommit } = connectionProperties
  const onLostConnection = () =>
    self.postMessage(boltConnectionErrorMessage(BoltConnectionError()))

  await ensureConnection(
    connectionProperties as any,
    connectionProperties.opts,
    onLostConnection
  )

  const transactionType = connectionTypeMap[connectionType]
  const res: any = transactionType.create(input, applyGraphTypes(parameters), {
    requestId,
    cancelable,
    txMetadata,
    useDb,
    autoCommit
  })

  return transactionType.getPromise(res)
}

const onmessage = function ({ data }: WorkerMessage): void {
  const messageType = data.type

  if (messageType === RUN_CYPHER_MESSAGE) {
    beforeWork()
    runCypherMessage(data)
      .then(res => {
        afterWork()
        self.postMessage(cypherResponseMessage(res))
      })
      .catch(err => {
        afterWork()
        self.postMessage(
          maybeCypherErrorMessage({ code: err.code, message: err.message })
        )
      })
  } else if (messageType === CANCEL_TRANSACTION_MESSAGE) {
    cancelTransaction(data.id, () => {
      self.postMessage(postCancelTransactionMessage())
    })
  } else if (messageType === CLOSE_CONNECTION_MESSAGE) {
    queueWork(() => {
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

const beforeWork = (): void => {
  busy = true
}

const afterWork = (): void => {
  busy = false
  doWork()
}

const queueWork = (fn: () => void): void => {
  workQueue.push(fn)
  doWork()
}
const doWork = (): void => {
  if (busy) {
    return
  }
  if (!workQueue.length) {
    return
  }

  const workFn = workQueue.shift()
  if (workFn) {
    workFn()
  }

  doWork()
}

self.addEventListener('message', onmessage as any)
