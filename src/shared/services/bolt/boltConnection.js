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

import neo4j from 'neo4j-driver'
import { v4 } from 'uuid'
import { BoltConnectionError, createErrorObject } from '../exceptions'
import { generateBoltHost } from 'services/utils'
import {
  KERBEROS,
  NATIVE,
  buildTxFunctionByMode
} from 'services/bolt/boltHelpers'

export const DIRECT_CONNECTION = 'DIRECT_CONNECTION'
export const ROUTED_WRITE_CONNECTION = 'ROUTED_WRITE_CONNECTION'
export const ROUTED_READ_CONNECTION = 'ROUTED_READ_CONNECTION'

const runningQueryRegister = {}
let _drivers = null
let _routingAvailable = false
const routingSchemes = ['bolt+routing://', 'neo4j://']

export const useRouting = url => isRoutingUrl(url) && _routingAvailable
const isRoutingUrl = url => {
  const boltUrl = generateBoltHost(url)
  for (let i = 0; i < routingSchemes.length; i++) {
    const routingScheme = routingSchemes[i]
    if (boltUrl.startsWith(routingScheme)) {
      return true
    }
  }
  return false
}

const _routingAvailability = () => {
  return directTransaction('CALL dbms.procedures() YIELD name').then(res => {
    const names = res.records.map(r => r.get(0))
    return names.includes('dbms.cluster.overview')
  })
}

export const hasMultiDbSupport = async () => {
  if (!_drivers) {
    return false
  }
  const tmpDriver = _drivers.getRoutedDriver()
  if (!tmpDriver) {
    return false
  }
  const supportsMultiDb = await tmpDriver.supportsMultiDb()
  return supportsMultiDb
}

const validateConnection = (driver, res, rej) => {
  driver
    .supportsMultiDb()
    .then(multiDbSupport => {
      if (!driver || !driver.session) return rej('No connection')
      const session = driver.session({
        defaultAccessMode: neo4j.session.READ,
        database: multiDbSupport ? 'system' : undefined
      })
      const txFn = buildTxFunctionByMode(session)
      txFn(tx => tx.run('CALL db.indexes()'))
        .then(() => {
          session.close()
          res(driver)
        })
        .catch(e => {
          session.close()
          // Only invalidate the connection if not available
          // or not authed
          // or credentials have expired
          const invalidStates = [
            'ServiceUnavailable',
            'Neo.ClientError.Security.AuthenticationRateLimit',
            'Neo.ClientError.Security.Unauthorized',
            'Neo.ClientError.Security.CredentialsExpired'
          ]
          if (!e.code || invalidStates.includes(e.code)) {
            rej(e)
          } else {
            res(driver)
          }
        })
    })
    .catch(rej)
}

const buildAuthObj = props => {
  let auth
  if (props.authenticationMethod === KERBEROS) {
    auth = neo4j.auth.kerberos(props.password)
  } else if (
    props.authenticationMethod === NATIVE ||
    !props.authenticationMethod
  ) {
    auth = neo4j.auth.basic(props.username, props.password)
  } else {
    auth = null
  }
  return auth
}

const getDriver = (host, auth, opts, onConnectFail = () => {}) => {
  const boltHost = generateBoltHost(host)
  try {
    const res = neo4j.driver(boltHost, auth, opts)
    return res
  } catch (e) {
    onConnectFail(e)
    return null
  }
}

export const getDriversObj = (props, opts = {}, onConnectFail = () => {}) => {
  const driversObj = {}
  const auth = buildAuthObj(props)
  const getDirectDriver = () => {
    if (driversObj.direct) return driversObj.direct
    driversObj.direct = getDriver(props.host, auth, opts, onConnectFail)
    return driversObj.direct
  }
  const getRoutedDriver = () => {
    if (!useRouting(props.host)) return getDirectDriver()
    if (driversObj.routed) return driversObj.routed
    driversObj.routed = getDriver(props.host, auth, opts, onConnectFail)
    return driversObj.routed
  }
  return {
    getDirectDriver,
    getRoutedDriver,
    close: () => {
      if (driversObj.direct) driversObj.direct.close()
      if (driversObj.routed) driversObj.routed.close()
    }
  }
}

export function directConnect(
  props,
  opts = {},
  onLostConnection = () => {},
  shouldValidateConnection = true
) {
  const p = new Promise((resolve, reject) => {
    const auth = buildAuthObj(props)
    const driver = getDriver(props.host, auth, opts, e => {
      onLostConnection(e)
      reject(e)
    })
    if (shouldValidateConnection) {
      validateConnection(driver, resolve, reject)
    } else {
      resolve(driver)
    }
  })
  return p
}

export function openConnection(props, opts = {}, onLostConnection = () => {}) {
  const p = new Promise((resolve, reject) => {
    const onConnectFail = e => {
      onLostConnection(e)
      _drivers = null
      reject(e)
    }
    const driversObj = getDriversObj(props, opts, onConnectFail)
    const driver = driversObj.getDirectDriver()
    const myResolve = driver => {
      _drivers = driversObj
      if (props.hasOwnProperty('inheritedUseRouting')) {
        _routingAvailable = props.inheritedUseRouting
        resolve(driver)
        return
      }
      if (isRoutingUrl(props.host)) {
        _routingAvailability()
          .then(r => {
            if (r) _routingAvailable = true
            if (!r) _routingAvailable = false
            resolve(driver)
          })
          .catch(e => {
            _routingAvailable = false
            resolve(driver)
          })
      } else {
        _routingAvailable = false
        resolve(driver)
      }
    }
    const myReject = err => {
      onLostConnection(err)
      _drivers = null
      driversObj.close()
      reject(err)
    }
    validateConnection(driver, myResolve, myReject)
  })
  return p
}

function _trackedTransaction(
  input,
  parameters = {},
  session,
  requestId = null,
  txMetadata = undefined,
  autoCommit = false
) {
  const id = requestId || v4()
  if (!session) {
    return [id, Promise.reject(createErrorObject(BoltConnectionError))]
  }
  const closeFn = (cb = () => {}) => {
    session.close(cb)
    if (runningQueryRegister[id]) delete runningQueryRegister[id]
  }
  runningQueryRegister[id] = closeFn

  const metadata = txMetadata ? { metadata: txMetadata } : undefined

  // Declare variable to store tx function in
  // so we can use same promise chain further down
  // for both types of tx functions
  let runFn

  // Transaction functions are the norm
  if (!autoCommit) {
    const txFn = buildTxFunctionByMode(session)
    // Use same fn signature as session.run
    runFn = (input, parameters, metadata) =>
      txFn(tx => tx.run(input, parameters, metadata))
  } else {
    // Auto-Commit transaction, only used for PERIODIC COMMIT etc.
    runFn = session.run.bind(session)
  }

  const queryPromise = runFn(input, parameters, metadata)
    .then(result => {
      closeFn()
      return result
    })
    .catch(e => {
      closeFn()
      throw e
    })
  return [id, queryPromise]
}

function _transaction(input, parameters, session, txMetadata = undefined) {
  if (!session) return Promise.reject(createErrorObject(BoltConnectionError))

  const metadata = txMetadata ? { metadata: txMetadata } : undefined
  const txFn = buildTxFunctionByMode(session)

  return txFn(tx => tx.run(input, parameters, metadata))
    .then(r => {
      session.close()
      return r
    })
    .catch(e => {
      session.close()
      throw e
    })
}

export function cancelTransaction(id, cb) {
  if (runningQueryRegister[id]) {
    runningQueryRegister[id](cb)
  }
}

export function directTransaction(
  input,
  parameters,
  requestId = null,
  cancelable = false,
  txMetadata = undefined,
  useDb = undefined
) {
  const session = _drivers
    ? _drivers
        .getDirectDriver()
        .session({ defaultAccessMode: neo4j.session.WRITE, database: useDb })
    : false
  if (!cancelable) return _transaction(input, parameters, session, txMetadata)
  return _trackedTransaction(input, parameters, session, requestId, txMetadata)
}

export function routedReadTransaction(
  input,
  parameters,
  requestId = null,
  cancelable = false,
  txMetadata = undefined,
  useDb = undefined
) {
  const session = _drivers
    ? _drivers
        .getRoutedDriver()
        .session({ defaultAccessMode: neo4j.session.READ, database: useDb })
    : false
  if (!cancelable) return _transaction(input, parameters, session, txMetadata)
  return _trackedTransaction(input, parameters, session, requestId, txMetadata)
}

export function routedWriteTransaction(
  input,
  parameters,
  requestId = null,
  cancelable = false,
  txMetadata = undefined,
  useDb = undefined,
  autoCommit = false
) {
  const session = _drivers
    ? _drivers
        .getRoutedDriver()
        .session({ defaultAccessMode: neo4j.session.WRITE, database: useDb })
    : false
  if (!cancelable) return _transaction(input, parameters, session, txMetadata)
  return _trackedTransaction(
    input,
    parameters,
    session,
    requestId,
    txMetadata,
    autoCommit
  )
}

export const closeConnection = () => {
  if (_drivers) {
    _drivers.close()
    _drivers = null
  }
}

export const ensureConnection = (props, opts, onLostConnection) => {
  const session = _drivers
    ? _drivers
        .getDirectDriver()
        .session({ defaultAccessMode: neo4j.session.READ })
    : false
  if (session) {
    return new Promise((resolve, reject) => {
      session.close()
      resolve()
    })
  } else {
    return openConnection(props, opts, onLostConnection)
  }
}
