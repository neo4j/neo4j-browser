import { AnyAction } from 'redux'

import { BoltConnectionError } from '../exceptions'
import {
  DIRECT_CONNECTION,
  ROUTED_READ_CONNECTION,
  ROUTED_WRITE_CONNECTION,
  closeGlobalConnection,
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

const connectionTypeMap = {
  [ROUTED_WRITE_CONNECTION]: routedWriteTransaction,
  [ROUTED_READ_CONNECTION]: routedReadTransaction,
  [DIRECT_CONNECTION]: directTransaction
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

const runCypherMessage = async (
  data: WorkerMessage['data'],
  postMessage: (msg: any, options?: any) => void
) => {
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
    postMessage(boltConnectionErrorMessage(BoltConnectionError()))

  await ensureConnection(
    connectionProperties as any,
    connectionProperties.opts,
    onLostConnection
  )

  const transactionType = connectionTypeMap[connectionType]
  const res: any = transactionType(input, applyGraphTypes(parameters), {
    requestId,
    cancelable,
    txMetadata,
    useDb,
    autoCommit
  })

  if (Array.isArray(res)) {
    return res[1]
  }

  return res
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

export const handleBoltWorkerMessage =
  (postMessage: (msg: any, options?: any) => void) =>
  ({ data }: WorkerMessage) => {
    const messageType = data.type

    if (messageType === RUN_CYPHER_MESSAGE) {
      beforeWork()
      runCypherMessage(data, postMessage)
        .then(res => {
          afterWork()
          postMessage(cypherResponseMessage(res))
        })
        .catch(err => {
          afterWork()
          postMessage(
            maybeCypherErrorMessage({ code: err.code, message: err.message })
          )
        })
    } else if (messageType === CANCEL_TRANSACTION_MESSAGE) {
      cancelTransaction(data.id, () => {
        postMessage(postCancelTransactionMessage())
      })
    } else if (messageType === CLOSE_CONNECTION_MESSAGE) {
      queueWork(() => {
        closeGlobalConnection()
      })
    } else {
      postMessage(
        cypherErrorMessage({
          code: -1,
          message: `Unknown message to Bolt Worker: ${messageType}`
        })
      )
    }
  }
