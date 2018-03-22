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

import { v1 as neo4j } from 'neo4j-driver-alias'
import { v4 } from 'uuid'
import { BoltConnectionError, createErrorObject } from '../exceptions'

export const DIRECT_CONNECTION = 'DIRECT_CONNECTION'
export const ROUTED_WRITE_CONNECTION = 'ROUTED_WRITE_CONNECTION'
export const ROUTED_READ_CONNECTION = 'ROUTED_READ_CONNECTION'

const runningQueryRegister = {}

let _drivers = null

let _useRoutingConfig = false
let _routingAvailable = false
let _inheritedUseRouting = false

export const useRouting = () =>
  (_useRoutingConfig && _routingAvailable) || _inheritedUseRouting

const _routingAvailability = () => {
  return directTransaction('CALL dbms.procedures()').then(res => {
    const names = res.records.map(r => r.get('name'))
    return names.indexOf('dbms.cluster.overview') > -1
  })
}

const validateConnection = (driver, res, rej) => {
  if (!driver || !driver.session) return rej('No connection')
  const tmp = driver.session()
  tmp
    .run('CALL db.indexes()')
    .then(() => {
      tmp.close()
      res(driver)
    })
    .catch(e => {
      rej(e)
    })
}

export const getDriver = (host, auth, opts, protocol) => {
  const boltHost = protocol + (host || '').split('bolt://').join('')
  return neo4j.driver(boltHost, auth, opts)
}

export const getDriversObj = (props, opts = {}) => {
  const driversObj = {}
  const auth =
    opts.withoutCredentials || !props.username
      ? undefined
      : neo4j.auth.basic(props.username, props.password)
  const getDirectDriver = () => {
    if (driversObj.direct) return driversObj.direct
    driversObj.direct = getDriver(props.host, auth, opts, 'bolt://')
    return driversObj.direct
  }
  const getRoutedDriver = () => {
    if (!useRouting()) return getDirectDriver()
    if (driversObj.routed) return driversObj.routed
    driversObj.routed = getDriver(props.host, auth, opts, 'bolt+routing://')
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

export function directConnect (
  props,
  opts = {},
  onLostConnection = () => {},
  shouldValidateConnection = true
) {
  const p = new Promise((resolve, reject) => {
    const creds =
      opts.withoutCredentials || !props.username
        ? undefined
        : neo4j.auth.basic(props.username, props.password)
    const driver = getDriver(props.host, creds, opts, 'bolt://')
    driver.onError = e => {
      onLostConnection(e)
      reject(e)
    }
    if (shouldValidateConnection) {
      validateConnection(driver, resolve, reject)
    } else {
      resolve(driver)
    }
  })
  return p
}

export function openConnection (props, opts = {}, onLostConnection) {
  const p = new Promise((resolve, reject) => {
    const driversObj = getDriversObj(props, opts)
    const driver = driversObj.getDirectDriver()
    driver.onError = e => {
      onLostConnection(e)
      _drivers = null
      reject(e)
    }
    const myResolve = driver => {
      _drivers = driversObj
      if (!props.hasOwnProperty('inheritedUseRouting')) {
        _routingAvailability()
          .then(r => {
            if (r) _routingAvailable = true
            if (!r) _routingAvailable = false
          })
          .catch(e => (_routingAvailable = false))
      } else {
        _inheritedUseRouting = props.inheritedUseRouting
      }
      resolve(driver)
    }
    const myReject = err => {
      _drivers = null
      driversObj.close()
      reject(err)
    }
    validateConnection(driver, myResolve, myReject)
  })
  return p
}

function _trackedTransaction (
  input,
  parameters = {},
  session,
  requestId = null
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

  const queryPromise = session
    .run(input, parameters)
    .then(r => {
      closeFn()
      return r
    })
    .catch(e => {
      closeFn()
      throw e
    })

  return [id, queryPromise]
}

function _transaction (input, parameters, session) {
  if (!session) return Promise.reject(createErrorObject(BoltConnectionError))
  return session
    .run(input, parameters)
    .then(r => {
      session.close()
      return r
    })
    .catch(e => {
      session.close()
      throw e
    })
}

export function cancelTransaction (id, cb) {
  if (runningQueryRegister[id]) {
    runningQueryRegister[id](cb)
  }
}

export function directTransaction (
  input,
  parameters,
  requestId = null,
  cancelable = false
) {
  const session = _drivers ? _drivers.getDirectDriver().session() : false
  if (!cancelable) return _transaction(input, parameters, session)
  return _trackedTransaction(input, parameters, session, requestId)
}

export function routedReadTransaction (
  input,
  parameters,
  requestId = null,
  cancelable = false
) {
  const session = _drivers
    ? _drivers.getRoutedDriver().session(neo4j.session.READ)
    : false
  if (!cancelable) return _transaction(input, parameters, session)
  return _trackedTransaction(input, parameters, session, requestId)
}

export function routedWriteTransaction (
  input,
  parameters,
  requestId = null,
  cancelable = false
) {
  const session = _drivers
    ? _drivers.getRoutedDriver().session(neo4j.session.WRITE)
    : false
  if (!cancelable) return _transaction(input, parameters, session)
  return _trackedTransaction(input, parameters, session, requestId)
}

export const closeConnection = () => {
  if (_drivers) {
    _drivers.close()
    _drivers = null
  }
}

export const ensureConnection = (props, opts, onLostConnection) => {
  const session = _drivers ? _drivers.getDirectDriver().session() : false
  if (session) {
    return new Promise((resolve, reject) => {
      session.close()
      resolve()
    })
  } else {
    return openConnection(props, opts, onLostConnection)
  }
}

export const setUseRoutingConfig = useRoutingConfig => {
  _useRoutingConfig = useRoutingConfig
}
