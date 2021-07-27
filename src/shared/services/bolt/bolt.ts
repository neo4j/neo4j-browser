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

import { v4 } from 'uuid'
import neo4j from 'neo4j-driver'
import WorkPool from '../WorkPool'
import * as mappings from './boltMappings'
import * as boltConnection from './boltConnection'
import {
  cancelTransaction as globalCancelTransaction,
  routedReadTransaction as globalRoutedReadTransaction,
  routedWriteTransaction as globalRoutedWriteTransaction,
  directTransaction as globalDirectTransaction
} from './transactions'
import {
  runCypherMessage,
  cancelTransactionMessage,
  closeConnectionMessage
} from './boltWorkerMessages'
import { NATIVE } from 'services/bolt/boltHelpers'
import { setupBoltWorker, addTypesAsField } from './setup-bolt-worker'

import BoltWorkerModule from 'shared/services/bolt/boltWorker'
import { Connection } from 'shared/modules/connections/connectionsDuck'

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
  const work = boltWorkPool.getWorkById(id)
  if (work) {
    work.onFinish(cb)
    work.execute(cancelTransactionMessage(id))
  } else {
    globalCancelTransaction(id, cb)
  }
}

function routedWriteTransaction(
  input: any,
  parameters: any,
  requestMetaData: any = {}
): any {
  const {
    useCypherThread = false,
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    autoCommit = false,
    useDb = null
  } = requestMetaData
  if (useCypherThread && window.Worker) {
    const id = requestId || v4()
    const workFn = runCypherMessage(
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
      workFn,
      onLostConnection
    )
    return [id, workerPromise]
  } else {
    return globalRoutedWriteTransaction(input, parameters, {
      requestId,
      cancelable,
      txMetadata,
      useDb: useDb || _useDb,
      autoCommit
    })
  }
}

function routedReadTransaction(
  input: any,
  parameters: any,
  requestMetaData: any = {}
): any {
  const {
    useCypherThread = false,
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    useDb = null
  } = requestMetaData
  if (useCypherThread && window.Worker) {
    const id = requestId || v4()
    const workFn = runCypherMessage(
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
      workFn,
      onLostConnection
    )
    return workerPromise
  } else {
    return globalRoutedReadTransaction(input, parameters, {
      requestId,
      cancelable,
      txMetadata,
      useDb: useDb || _useDb
    })
  }
}

function directTransaction(
  input: any,
  parameters: any,
  requestMetaData: any = {}
): any {
  const {
    useCypherThread = false,
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    useDb = null
  } = requestMetaData
  if (useCypherThread && window.Worker) {
    const id = requestId || v4()
    const workFn = runCypherMessage(
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
      workFn,
      onLostConnection
    )
    return workerPromise
  } else {
    return globalDirectTransaction(input, parameters, {
      requestId,
      cancelable,
      txMetadata,
      useDb: useDb || _useDb
    })
  }
}

const closeConnectionInWorkers = (): void => {
  boltWorkPool.messageAllWorkers(closeConnectionMessage())
}

export default {
  hasMultiDbSupport: boltConnection.hasMultiDbSupport,
  useDb: (db: any) => (_useDb = db),
  directConnect: boltConnection.directConnect,
  openConnection,
  closeConnection: () => {
    connectionProperties = null
    boltConnection.closeConnection()
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
