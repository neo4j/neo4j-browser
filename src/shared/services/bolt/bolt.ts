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
import neo4j, { QueryResult } from 'neo4j-driver'
import { v4 } from 'uuid'

import WorkPool from '../WorkPool'
import * as boltConnection from './boltConnection'
import * as mappings from './boltMappings'
import {
  cancelTransactionMessage,
  closeConnectionMessage,
  getWorkerPayloadForRunningCypherMessage
} from './boltWorkerMessages'
import { addTypesAsField, setupBoltWorker } from './setup-bolt-worker'
import { cancelTransaction as globalCancelTransaction } from './transactions'
import { NATIVE } from 'services/bolt/boltHelpers'
import {
  Connection,
  onLostConnection
} from 'shared/modules/connections/connectionsDuck'
import BoltWorkerModule from 'shared/services/bolt/boltWorker'
import { backgroundTxMetadata } from './txMetadata'
import { getGlobalDrivers } from './globalDrivers'
import { BoltConnectionError } from 'services/exceptions'
import { isBoltConnectionErrorCode } from './boltConnectionErrors'

let connectionProperties: {} | null = null
let _useDb: string | null = null
const boltWorkPool = new WorkPool(() => new BoltWorkerModule(), 10)

function openConnection(
  props: Connection,
  opts = {},
  onLostConnection?: (error: Error) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    boltConnection
      .openConnection(props, opts, onLostConnection)
      .then(() => {
        connectionProperties = {
          authenticationMethod: props.authenticationMethod || NATIVE,
          username: props.username,
          password: props.password,
          host: props.host,
          opts
        }
        resolve()
      })
      .catch(e => {
        connectionProperties = null
        reject(e)
      })
  })
}

function cancelTransaction(id: string, cb: any): void {
  const worker = boltWorkPool.getWorkerById(id)
  if (worker) {
    worker.work!.onFinish = cb
    worker.execute(cancelTransactionMessage(id))
  } else {
    globalCancelTransaction(id, cb)
  }
}

function routedWriteTransaction(
  input: any,
  parameters: any,
  requestMetaData: any = {}
): [string, Promise<QueryResult>] {
  const {
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    autoCommit = false,
    useDb = null
  } = requestMetaData
  const id = requestId || v4()
  const payload = getWorkerPayloadForRunningCypherMessage(
    input,
    mappings.recursivelyTypeGraphItems(parameters),
    boltConnection.ROUTED_WRITE_CONNECTION,
    id,
    cancelable,
    {
      ...connectionProperties,
      txMetadata,
      useDb: useDb || _useDb,
      autoCommit
    }
  )
  const workerPromise = setupBoltWorker(
    boltWorkPool,
    id,
    payload,
    onLostConnection
  )
  return [id, workerPromise]
}

function routedReadTransaction(
  input: any,
  parameters: any,
  requestMetaData: any = {}
): Promise<QueryResult> {
  const {
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    useDb = null
  } = requestMetaData
  const id = requestId || v4()
  const payload = getWorkerPayloadForRunningCypherMessage(
    input,
    mappings.recursivelyTypeGraphItems(parameters),
    boltConnection.ROUTED_READ_CONNECTION,
    id,
    cancelable,
    {
      ...connectionProperties,
      txMetadata,
      useDb: useDb || _useDb
    }
  )
  const workerPromise = setupBoltWorker(
    boltWorkPool,
    id,
    payload,
    onLostConnection
  )
  return workerPromise
}

function directTransaction(
  input: any,
  parameters: any,
  requestMetaData: any = {}
): Promise<QueryResult> {
  const {
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    useDb = null
  } = requestMetaData
  const id = requestId || v4()
  const payload = getWorkerPayloadForRunningCypherMessage(
    input,
    mappings.recursivelyTypeGraphItems(parameters),
    boltConnection.DIRECT_CONNECTION,
    id,
    cancelable,
    {
      ...connectionProperties,
      txMetadata,
      useDb: useDb || _useDb
    }
  )
  const workerPromise = setupBoltWorker(
    boltWorkPool,
    id,
    payload,
    onLostConnection
  )
  return workerPromise
}

async function backgroundWorkerlessRoutedRead(
  input: string,
  { useDb }: { useDb?: string },
  store: any
): Promise<QueryResult> {
  const session = getGlobalDrivers()
    ?.getRoutedDriver()
    ?.session({
      defaultAccessMode: neo4j.session.READ,
      database: useDb ?? undefined
    })

  if (!session) return Promise.reject(BoltConnectionError())

  return session
    .executeRead(tx => tx.run(input), {
      metadata: backgroundTxMetadata.txMetadata
    })
    .catch(e => {
      if (!e.code || isBoltConnectionErrorCode(e.code)) {
        onLostConnection(store.dispatch)(e)
      }
      throw e
    })
    .finally(() => session.close())
}

const closeConnectionInWorkers = (): void => {
  boltWorkPool.messageAllWorkers(closeConnectionMessage())
}

export default {
  backgroundWorkerlessRoutedRead,
  quickVerifyConnectivity: boltConnection.quickVerifyConnectivity,
  hasMultiDbSupport: boltConnection.hasMultiDbSupport,
  useDb: (db: any) => (_useDb = db),
  directConnect: boltConnection.directConnect,
  openConnection,
  closeConnection: () => {
    connectionProperties = null
    boltConnection.closeGlobalConnection()
    closeConnectionInWorkers()
  },
  directTransaction,
  routedReadTransaction,
  routedWriteTransaction,
  cancelTransaction,
  recordsToTableArray: (records: any, convertInts = true) => {
    const intChecker = convertInts ? neo4j.isInt : () => true
    const intConverter = convertInts
      ? (item: any) =>
          mappings.itemIntToString(item, {
            intChecker: neo4j.isInt,
            intConverter: (val: any) => val.toNumber()
          })
      : (val: any) => val
    return mappings.recordsToTableArray(records, {
      intChecker,
      intConverter,
      objectConverter: mappings.extractFromNeoObjects
    })
  },
  extractNodesAndRelationshipsFromRecords: (
    records: any,
    maxFieldItems: any
  ) => {
    return mappings.extractNodesAndRelationshipsFromRecords(
      records,
      neo4j.types,
      maxFieldItems
    )
  },
  extractNodesAndRelationshipsFromRecordsForOldVis: (
    records: any,
    filterRels = true,
    maxFieldItems: any
  ) => {
    const intChecker = neo4j.isInt
    const intConverter = (val: any): string => val.toString()

    return mappings.extractNodesAndRelationshipsFromRecordsForOldVis(
      records,
      neo4j.types,
      filterRels,
      {
        intChecker,
        intConverter,
        objectConverter: mappings.extractFromNeoObjects
      },
      maxFieldItems
    )
  },
  extractPlan: (result: any, calculateTotalDbHits?: boolean) => {
    return mappings.extractPlan(result, calculateTotalDbHits)
  },
  retrieveFormattedUpdateStatistics: mappings.retrieveFormattedUpdateStatistics,
  itemIntToNumber: (item: any) =>
    mappings.itemIntToString(item, {
      intChecker: neo4j.isInt,
      intConverter: (val: any) => val.toNumber(),
      objectConverter: mappings.extractFromNeoObjects
    }),
  addTypesAsField
}
