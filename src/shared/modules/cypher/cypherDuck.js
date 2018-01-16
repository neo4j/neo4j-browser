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

import Rx from 'rxjs'

import bolt from 'services/bolt/bolt'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import { getCausalClusterAddresses } from './queriesProcedureHelper'
import { getEncryptionMode } from 'services/bolt/boltHelpers'
import { flatten } from 'services/utils'

const NAME = 'cypher'
export const CYPHER_REQUEST = NAME + '/REQUEST'
export const AD_HOC_CYPHER_REQUEST = NAME + '/AD_HOC_REQUEST'
export const CLUSTER_CYPHER_REQUEST = NAME + '/CLUSTER_REQUEST'
export const FORCE_CHANGE_PASSWORD = NAME + '/FORCE_CHANGE_PASSWORD'

// Helpers
const adHocSession = (driver, resolve, action) => {
  const session = driver.session()
  session
    .run(action.query, action.parameters)
    .then(r => {
      driver.close()
      resolve({
        type: action.$$responseChannel,
        success: true,
        result: Object.assign({}, r, { meta: action.host })
      })
    })
    .catch(e => {
      driver.close()
      resolve({ type: action.$$responseChannel, success: false, error: e })
    })
}
const callClusterMember = (connection, action, store) => {
  return new Promise((resolve, reject) => {
    bolt
      .directConnect(connection, undefined, undefined, false) // Ignore validation errors
      .then(driver => {
        adHocSession(driver, resolve, action)
      })
      .catch(e => {
        resolve({ type: action.$$responseChannel, success: false, error: e })
      })
  })
}

// Epics
export const cypherRequestEpic = (some$, store) =>
  some$.ofType(CYPHER_REQUEST).mergeMap(action => {
    if (!action.$$responseChannel) return Rx.Observable.of(null)
    return bolt
      .directTransaction(action.query, action.params || undefined)
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
    const tempConnection = Object.assign({}, connection, { host: action.host })
    return callClusterMember(tempConnection, action, store)
  })

export const clusterCypherRequestEpic = (some$, store) =>
  some$
    .ofType(CLUSTER_CYPHER_REQUEST)
    .mergeMap(action => {
      if (!action.$$responseChannel) return Rx.Observable.of(null)
      return bolt
        .directTransaction(getCausalClusterAddresses)
        .then(res => {
          const addresses = flatten(
            res.records.map(record => record.get('addresses'))
          ).filter(address => address.startsWith('bolt://'))
          return {
            action,
            observables: addresses.map(host => {
              const connection = getActiveConnectionData(store.getState())
              const tempConnection = Object.assign({}, connection, { host })
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
      let action = value.pop()
      const records = value.reduce((acc, { result }) => {
        return acc.concat(
          result.records.map(record =>
            Object.assign({}, record, { host: result.summary.server.address })
          )
        )
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
          { encrypted: getEncryptionMode(action) },
          undefined,
          false // Ignore validation errors
        )
        .then(driver => {
          adHocSession(driver, resolve, action)
        })
        .catch(e =>
          resolve({ type: action.$$responseChannel, success: false, error: e })
        )
    })
  })
