/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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
import { runCypherMessage, cancelTransactionMessage, CYPHER_ERROR_MESSAGE, CYPHER_RESPONSE_MESSAGE, POST_CANCEL_TRANSACTION_MESSAGE } from './boltWorkerMessages'

let connectionProperties = null
let boltWorkerRegister = {}
let cancellationRegister = {}

function openConnection (props, opts = {}, onLostConnection) {
  return new Promise((resolve, reject) => {
    boltConnection.openConnection(props, opts, onLostConnection)
      .then((r) => {
      // TODO : Encryption in opts, properties !! and check other props !!!!
        connectionProperties = { username: props.username, password: props.password, host: props.host }
        resolve(r)
      })
      .catch((e) => {
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

function routedWriteTransaction (input, parameters, requestId = null, cancelable = false) {
  // TODO check max number of web workers
  if (window.Worker) {
    const id = requestId || v4()
    const BoltWorkerModule = require('worker-loader!./boltWorker.js')
    const boltWorker = new BoltWorkerModule()
    boltWorkerRegister[id] = boltWorker

    const workerPromise = new Promise((resolve, reject) => {
      boltWorker.postMessage(runCypherMessage(input, parameters, requestId, cancelable, {...connectionProperties, inheritedUseRouting: boltConnection.useRouting()}))
      boltWorker.onmessage = (msg) => {
        if (msg.data.type === CYPHER_ERROR_MESSAGE) {
          reject(msg.data.error)
        } else if (msg.data.type === CYPHER_RESPONSE_MESSAGE) {
          let records = msg.data.result.records.map(record => {
            const typedRecord = new neo4j.types.Record(record.keys, record._fields, record._fieldLookup)
            if (typedRecord._fields) {
              typedRecord._fields = typedRecord._fields.map(field => mappings.applyGraphTypes(field))
            }
            return typedRecord
          })

          let summary = mappings.applyGraphTypes(msg.data.result.summary)
          resolve({summary, records})

          if (boltWorkerRegister[id]) {
            delete boltWorkerRegister[id]
          }
        } else if (msg.data.type === POST_CANCEL_TRANSACTION_MESSAGE) {
          if (cancellationRegister[id]) {
            cancellationRegister[id]()
            delete cancellationRegister[id]
          }

          if (boltWorkerRegister[id]) {
            delete boltWorkerRegister[id]
          }
        }
      }
    })

    return [id, workerPromise]
  } else {
    return boltConnection.routedWriteTransaction(input, parameters, requestId, cancelable)
  }
}

export default {
  directConnect: boltConnection.directConnect,
  openConnection,
  closeConnection: boltConnection.closeConnection,
  directTransaction: boltConnection.directTransaction,
  routedReadTransaction: boltConnection.routedReadTransaction,
  routedWriteTransaction,
  cancelTransaction,
  useRoutingConfig: (shouldWe) => boltConnection.setUseRoutingConfig(shouldWe),
  recordsToTableArray: (records, convertInts = true) => {
    const intChecker = convertInts ? neo4j.isInt : () => true
    const intConverter = convertInts ? (item) => mappings.itemIntToString(item, { intChecker: neo4j.isInt, intConverter: (val) => val.toNumber() }) : (val) => val
    return mappings.recordsToTableArray(records, { intChecker, intConverter, objectConverter: mappings.extractFromNeoObjects })
  },
  extractNodesAndRelationshipsFromRecords: (records) => {
    return mappings.extractNodesAndRelationshipsFromRecords(records, neo4j.types)
  },
  extractNodesAndRelationshipsFromRecordsForOldVis: (records, filterRels = true) => {
    const intChecker = neo4j.isInt
    const intConverter = (val) => val.toString()
    return mappings.extractNodesAndRelationshipsFromRecordsForOldVis(records, neo4j.types, filterRels, { intChecker, intConverter, objectConverter: mappings.extractFromNeoObjects })
  },
  extractPlan: (result, calculateTotalDbHits) => {
    return mappings.extractPlan(result, calculateTotalDbHits)
  },
  retrieveFormattedUpdateStatistics: mappings.retrieveFormattedUpdateStatistics,
  itemIntToNumber: (item) => mappings.itemIntToString(item, { intChecker: neo4j.isInt, intConverter: (val) => val.toNumber(), objectConverter: mappings.extractFromNeoObjects }),
  neo4j: neo4j
}
