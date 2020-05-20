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

import Rx from 'rxjs'
import neo4j from 'neo4j-driver'
import bolt from 'services/bolt/bolt'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import { getCausalClusterAddresses } from './queriesProcedureHelper'
import { buildTxFunctionByMode } from 'services/bolt/boltHelpers'
import { flatten } from 'services/utils'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { getUserTxMetadata } from 'services/bolt/txMetadata'
import {
  canSendTxMetadata,
  changeUserPasswordQuery,
  driverDatabaseSelection,
  FIRST_MULTI_DB_SUPPORT,
  FIRST_NO_MULTI_DB_SUPPORT
} from '../features/versionedFeatures'
import {
  updateServerInfo,
  serverInfoQuery,
  getVersion
} from '../dbMeta/dbMetaDuck'

const NAME = 'cypher'
export const CYPHER_REQUEST = `${NAME}/REQUEST`
export const AD_HOC_CYPHER_REQUEST = `${NAME}/AD_HOC_REQUEST`
export const CLUSTER_CYPHER_REQUEST = `${NAME}/CLUSTER_REQUEST`
export const FORCE_CHANGE_PASSWORD = `${NAME}/FORCE_CHANGE_PASSWORD`

// Helpers
const queryAndResolve = async (driver, action, host, useDb = {}) => {
  return new Promise(resolve => {
    const session = driver.session({
      defaultAccessMode: neo4j.session.WRITE,
      ...useDb
    })
    const txFn = buildTxFunctionByMode(session)
    txFn(tx => tx.run(action.query, action.parameters))
      .then(r => {
        session.close()
        resolve({
          type: action.$$responseChannel,
          success: true,
          result: {
            ...r,
            meta: action.host
          }
        })
      })
      .catch(e => {
        session.close()
        resolve({
          type: action.$$responseChannel,
          success: false,
          error: e,
          host
        })
      })
  })
}
const callClusterMember = async (connection, action, store) => {
  return new Promise(resolve => {
    bolt
      .directConnect(connection, undefined, undefined, false) // Ignore validation errors
      .then(async driver => {
        const res = await queryAndResolve(driver, action, connection.host)
        driver.close()
        resolve(res)
      })
      .catch(error => {
        resolve({
          type: action.$$responseChannel,
          success: false,
          host: connection.host,
          error
        })
      })
  })
}

// Epics
export const cypherRequestEpic = (some$, store) =>
  some$.ofType(CYPHER_REQUEST).mergeMap(action => {
    if (!action.$$responseChannel) return Rx.Observable.of(null)
    return bolt
      .directTransaction(action.query, action.params || undefined, {
        useCypherThread: shouldUseCypherThread(store.getState()),
        ...getUserTxMetadata(action.queryType || null)({
          hasServerSupport: canSendTxMetadata(store.getState())
        }),
        useDb: action.useDb
      })
      .then(r => ({ type: action.$$responseChannel, success: true, result: r }))
      .catch(e => ({
        type: action.$$responseChannel,
        success: false,
        error: e
      }))
  })

export const adHocCypherRequestEpic = (some$, store) =>
  some$.ofType(AD_HOC_CYPHER_REQUEST).mergeMap(action => {
    const connection = getActiveConnectionData(store.getState())
    const tempConnection = {
      ...connection,
      host: action.host
    }
    return callClusterMember(tempConnection, action, store)
  })

export const clusterCypherRequestEpic = (some$, store) =>
  some$
    .ofType(CLUSTER_CYPHER_REQUEST)
    .mergeMap(action => {
      if (!action.$$responseChannel) return Rx.Observable.of(null)
      return bolt
        .directTransaction(
          getCausalClusterAddresses,
          {},
          { useCypherThread: shouldUseCypherThread(store.getState()) }
        )
        .then(res => {
          const addresses = flatten(
            res.records.map(record => record.get('addresses'))
          ).filter(address => address.startsWith('bolt://'))
          return {
            action,
            observables: addresses.map(host => {
              const connection = getActiveConnectionData(store.getState())
              const tempConnection = {
                ...connection,
                host
              }
              return Rx.Observable.fromPromise(
                callClusterMember(tempConnection, action, store)
              )
            })
          }
        })
        .catch(error => {
          return Rx.Observable.of({ action, error })
        })
    })
    .flatMap(({ action, observables, value }) => {
      if (value) return Rx.Observable.of(value)
      observables.push(Rx.Observable.of(action))
      return Rx.Observable.forkJoin(...observables)
    })
    .map(value => {
      if (value && value.error) {
        return {
          type: value.action.$$responseChannel,
          success: false,
          error: value.error
        }
      }
      const action = value.pop()
      const records = value.reduce((acc, { result, success, error, host }) => {
        if (!success) {
          return [
            {
              error: {
                host,
                message: error.message,
                code: error.code
              }
            }
          ]
        }
        const mappedRes = result.records.map(record => ({
          ...record,
          host: result.summary.server.address
        }))
        return [...acc, ...mappedRes]
      }, [])
      return {
        type: action.$$responseChannel,
        success: true,
        result: { records }
      }
    })

// We need this because this is the only case where we still
// want to execute cypher even though we get an connection error back
export const handleForcePasswordChangeEpic = (some$, store) =>
  some$.ofType(FORCE_CHANGE_PASSWORD).mergeMap(action => {
    if (!action.$$responseChannel) return Rx.Observable.of(null)

    return new Promise((resolve, reject) => {
      bolt
        .directConnect(
          action,
          {},
          undefined,
          false // Ignore validation errors
        )
        .then(async driver => {
          // Let's establish what server version we're connected to if not in state
          if (!getVersion(store.getState())) {
            const versionRes = await queryAndResolve(
              driver,
              { ...action, query: serverInfoQuery, parameters: {} },
              undefined
            )
            // What does the driver say, does the server support multidb?
            const supportsMultiDb = await driver.supportsMultiDb()
            if (!versionRes.success) {
              // This is just a placeholder version to figure out how to
              // change password. This will be updated to the correct server version
              // when we're connected and dbMetaEpic runs
              const fakeVersion = supportsMultiDb
                ? FIRST_MULTI_DB_SUPPORT
                : FIRST_NO_MULTI_DB_SUPPORT
              versionRes.result = {
                records: [],
                summary: { server: { version: `placeholder/${fakeVersion}` } }
              }
            }
            store.dispatch(updateServerInfo(versionRes.result))
          }
          // Figure out how to change the pw on that server version
          const queryObj = changeUserPasswordQuery(
            store.getState(),
            action.password,
            action.newPassword
          )
          // and then change the password
          const res = await queryAndResolve(
            driver,
            { ...action, ...queryObj },
            undefined,
            driverDatabaseSelection(store.getState(), 'system') // target system db if it has multi-db support
          )
          driver.close()
          resolve(res)
        })
        .catch(e =>
          resolve({ type: action.$$responseChannel, success: false, error: e })
        )
    })
  })
