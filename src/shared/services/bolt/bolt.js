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

import { v4 } from 'uuid'
import { v1 as neo4j } from 'neo4j-driver-alias'
import * as mappings from './boltMappings'
import * as boltConnection from './boltConnection'
import {
  runCypherMessage,
  cancelTransactionMessage,
  CYPHER_ERROR_MESSAGE,
  CYPHER_RESPONSE_MESSAGE,
  POST_CANCEL_TRANSACTION_MESSAGE
} from './boltWorkerMessages'

/* eslint-disable import/no-webpack-loader-syntax */
import BoltWorkerModule from 'worker-loader?inline!./boltWorker.js'
/* eslint-enable import/no-webpack-loader-syntax */

let connectionProperties = null
let boltWorkerRegister = {}
let cancellationRegister = {}

function openConnection (props, opts = {}, onLostConnection) {
  return new Promise((resolve, reject) => {
    boltConnection
      .openConnection(props, opts, onLostConnection)
      .then(r => {
        connectionProperties = {
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

function cancelTransaction (id, cb) {
  if (boltWorkerRegister[id]) {
    cancellationRegister[id] = cb
    boltWorkerRegister[id].postMessage(cancelTransactionMessage(id))
  } else {
    boltConnection.cancelTransaction(id, cb)
  }
}

function routedWriteTransaction (
  input,
  parameters,
  requestId = null,
  cancelable = false,
  useCypherThread
) {
  if (useCypherThread && window.Worker) {
    const id = requestId || v4()
    const boltWorker = new BoltWorkerModule()
    boltWorkerRegister[id] = boltWorker

    const workerFinalizer = getWorkerFinalizer(
      boltWorkerRegister,
      cancellationRegister,
      id
    )

    const workerPromise = new Promise((resolve, reject) => {
      boltWorker.postMessage(
        runCypherMessage(input, parameters, id, cancelable, {
          ...connectionProperties,
          inheritedUseRouting: boltConnection.useRouting()
        })
      )
      boltWorker.onmessage = msg => {
        if (msg.data.type === CYPHER_ERROR_MESSAGE) {
          workerFinalizer(boltWorker)
          reject(msg.data.error)
        } else if (msg.data.type === CYPHER_RESPONSE_MESSAGE) {
          let records = msg.data.result.records.map(record => {
            const typedRecord = new neo4j.types.Record(
              record.keys,
              record._fields,
              record._fieldLookup
            )
            if (typedRecord._fields) {
              typedRecord._fields = typedRecord._fields.map(field =>
                mappings.applyGraphTypes(field)
              )
            }
            return typedRecord
          })

          let summary = mappings.applyGraphTypes(msg.data.result.summary)
          workerFinalizer(boltWorker)
          resolve({ summary, records })
        } else if (msg.data.type === POST_CANCEL_TRANSACTION_MESSAGE) {
          workerFinalizer(boltWorker)
        }
      }
    })

    return [id, workerPromise]
  } else {
    return boltConnection.routedWriteTransaction(
      input,
      parameters,
      requestId,
      cancelable
    )
  }
}

function getWorkerFinalizer (workerRegister, cancellationRegister, workerId) {
  return worker => {
    if (cancellationRegister[workerId]) {
      cancellationRegister[workerId]()
      delete cancellationRegister[workerId]
    }
    if (workerRegister[workerId]) {
      delete workerRegister[workerId]
    }
    if (worker) {
      worker.terminate()
    }
  }
}

export default {
  directConnect: boltConnection.directConnect,
  openConnection,
  closeConnection: () => {
    connectionProperties = null
    boltConnection.closeConnection()
  },
  directTransaction: boltConnection.directTransaction,
  routedReadTransaction: boltConnection.routedReadTransaction,
  routedWriteTransaction,
  cancelTransaction,
  useRoutingConfig: shouldWe => boltConnection.setUseRoutingConfig(shouldWe),
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
  neo4j: neo4j
}
