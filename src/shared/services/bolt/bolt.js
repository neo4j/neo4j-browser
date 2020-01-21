/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { generateBoltHost } from 'services/utils'
import {
  runCypherMessage,
  cancelTransactionMessage,
  closeConnectionMessage,
  CYPHER_ERROR_MESSAGE,
  CYPHER_RESPONSE_MESSAGE,
  POST_CANCEL_TRANSACTION_MESSAGE,
  BOLT_CONNECTION_ERROR_MESSAGE
} from './boltWorkerMessages'
import { NATIVE } from 'services/bolt/boltHelpers'
import BoltWorkerModule from 'worker-loader?inline!./boltWorker.js'

let connectionProperties = null
let _useDb = null
const boltWorkPool = new WorkPool(() => new BoltWorkerModule(), 10)

function openConnection(props, opts = {}, onLostConnection) {
  return new Promise((resolve, reject) => {
    boltConnection
      .openConnection(props, opts, onLostConnection)
      .then(r => {
        connectionProperties = {
          authenticationMethod: props.authenticationMethod || NATIVE,
          username: props.username,
          password: props.password,
          host: props.host,
          opts
        }
        resolve(r)
      })
      .catch(e => {
        connectionProperties = null
        reject(e)
      })
  })
}

function cancelTransaction(id, cb) {
  const work = boltWorkPool.getWorkById(id)
  if (work) {
    work.onFinish(cb)
    work.execute(cancelTransactionMessage(id))
  } else {
    boltConnection.cancelTransaction(id, cb)
  }
}

function routedWriteTransaction(input, parameters, requestMetaData = {}) {
  const {
    useCypherThread = false,
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    autoCommit = false
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
        inheritedUseRouting: boltConnection.useRouting(
          generateBoltHost(
            connectionProperties ? connectionProperties.host : ''
          )
        ),
        txMetadata,
        useDb: _useDb,
        autoCommit
      }
    )
    const workerPromise = setupBoltWorker(id, workFn, onLostConnection)
    return [id, workerPromise]
  } else {
    return boltConnection.routedWriteTransaction(
      input,
      parameters,
      requestId,
      cancelable,
      txMetadata,
      _useDb,
      autoCommit
    )
  }
}

function routedReadTransaction(input, parameters, requestMetaData = {}) {
  const {
    useCypherThread = false,
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined
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
        inheritedUseRouting: boltConnection.useRouting(
          generateBoltHost(
            connectionProperties ? connectionProperties.host : ''
          )
        ),
        txMetadata,
        useDb: _useDb
      }
    )
    const workerPromise = setupBoltWorker(id, workFn, onLostConnection)
    return workerPromise
  } else {
    return boltConnection.routedReadTransaction(
      input,
      parameters,
      requestId,
      cancelable,
      txMetadata,
      _useDb
    )
  }
}

function directTransaction(input, parameters, requestMetaData = {}) {
  const {
    useCypherThread = false,
    requestId = null,
    cancelable = false,
    onLostConnection = () => {},
    txMetadata = undefined,
    useDb
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
        inheritedUseRouting: boltConnection.useRouting(
          generateBoltHost(
            connectionProperties ? connectionProperties.host : ''
          )
        ),
        txMetadata,
        useDb: useDb !== undefined ? useDb : _useDb
      }
    )
    const workerPromise = setupBoltWorker(id, workFn, onLostConnection)
    return workerPromise
  } else {
    return boltConnection.directTransaction(
      input,
      parameters,
      requestId,
      cancelable,
      txMetadata,
      _useDb
    )
  }
}

const addTypesAsField = result => {
  const records = result.records.map(record => {
    const typedRecord = new neo4j.types.Record(
      record.keys,
      record._fields,
      record._fieldLookup
    )
    if (typedRecord._fields) {
      typedRecord._fields = mappings.applyGraphTypes(typedRecord._fields)
    }
    return typedRecord
  })
  const summary = mappings.applyGraphTypes(result.summary)
  return { summary, records }
}

function setupBoltWorker(id, workFn, onLostConnection = () => {}) {
  const workerPromise = new Promise((resolve, reject) => {
    const work = boltWorkPool.doWork({
      id,
      payload: workFn,
      onmessage: msg => {
        if (msg.data.type === BOLT_CONNECTION_ERROR_MESSAGE) {
          work.finish()
          onLostConnection(msg.data.error)
          return reject(msg.data.error)
        }
        if (msg.data.type === CYPHER_ERROR_MESSAGE) {
          work.finish()
          reject(msg.data.error)
        } else if (msg.data.type === CYPHER_RESPONSE_MESSAGE) {
          work.finish()
          resolve(addTypesAsField(msg.data.result))
        } else if (msg.data.type === POST_CANCEL_TRANSACTION_MESSAGE) {
          work.finish()
        }
      }
    })
  })
  return workerPromise
}

const closeConnectionInWorkers = () => {
  boltWorkPool.messageAllWorkers(closeConnectionMessage())
}

export default {
  hasMultiDbSupport: async () => {
    const supportsMultiDb = await boltConnection.hasMultiDbSupport()
    return supportsMultiDb
  },
  useDb: db => (_useDb = db),
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
  recordsToTableArray: (records, convertInts = true) => {
    const intChecker = convertInts ? neo4j.isInt : () => true
    const intConverter = convertInts
      ? item =>
          mappings.itemIntToString(item, {
            intChecker: neo4j.isInt,
            intConverter: val => val.toNumber()
          })
      : val => val
    return mappings.recordsToTableArray(records, {
      intChecker,
      intConverter,
      objectConverter: mappings.extractFromNeoObjects
    })
  },
  extractNodesAndRelationshipsFromRecords: records => {
    return mappings.extractNodesAndRelationshipsFromRecords(
      records,
      neo4j.types
    )
  },
  extractNodesAndRelationshipsFromRecordsForOldVis: (
    records,
    filterRels = true
  ) => {
    const intChecker = neo4j.isInt
    const intConverter = val => val.toString()
    return mappings.extractNodesAndRelationshipsFromRecordsForOldVis(
      records,
      neo4j.types,
      filterRels,
      {
        intChecker,
        intConverter,
        objectConverter: mappings.extractFromNeoObjects
      }
    )
  },
  extractPlan: (result, calculateTotalDbHits) => {
    return mappings.extractPlan(result, calculateTotalDbHits)
  },
  retrieveFormattedUpdateStatistics: mappings.retrieveFormattedUpdateStatistics,
  itemIntToNumber: item =>
    mappings.itemIntToString(item, {
      intChecker: neo4j.isInt,
      intConverter: val => val.toNumber(),
      objectConverter: mappings.extractFromNeoObjects
    }),
  neo4j: neo4j,
  addTypesAsField
}
