import { v4 } from 'uuid'
import { v1 as neo4j } from 'neo4j-driver-alias'
import * as mappings from './boltMappings'
import { BoltConnectionError } from '../exceptions'

let _drivers = null
const runningQueryRegister = {}
let _useRouting = false

const _getDriver = (host, auth, opts, protocol) => {
  const boltHost = protocol + host.split('bolt://').join('')
  return neo4j.driver(boltHost, auth, opts)
}

const _validateConnection = (driver, res, rej) => {
  if (!driver || !driver.session) return rej('No connection')
  const tmp = driver.session()
  tmp.run('CALL db.labels()').then(() => {
    tmp.close()
    res(driver)
  }).catch((e) => rej([e, driver]))
}

const _getDriversObj = (props, opts = {}) => {
  const driversObj = {}
  const auth = opts.withoutCredentials || !props.username
      ? undefined
      : neo4j.auth.basic(props.username, props.password)
  const getDirectDriver = () => {
    if (driversObj.direct) return driversObj.direct
    driversObj.direct = _getDriver(props.host, auth, opts, 'bolt://')
    return driversObj.direct
  }
  const getRoutedDriver = () => {
    if (!_useRouting) return getDirectDriver()
    if (driversObj.routed) return driversObj.routed
    driversObj.routed = _getDriver(props.host, auth, opts, 'bolt+routing://')
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

function connect (props, opts = {}, onLostConnection = () => {}) {
  const p = new Promise((resolve, reject) => {
    const creds = opts.withoutCredentials || !props.username
      ? undefined
      : neo4j.auth.basic(props.username, props.password)
    const driver = _getDriver(opts.host, creds, opts, 'bolt://')
    driver.onError = (e) => {
      onLostConnection(e)
      reject([e, driver])
    }
    _validateConnection(driver, resolve, reject)
  })
  return p
}

function openConnection (props, opts = {}, onLostConnection) {
  const p = new Promise((resolve, reject) => {
    const driversObj = _getDriversObj(props, opts)
    const driver = driversObj.getDirectDriver()
    driver.onError = (e) => {
      onLostConnection(e)
      _drivers = null
      driversObj.close()
      reject([e, driver])
    }
    const myResolve = (driver) => {
      _drivers = driversObj
      resolve(driver)
    }
    const myReject = (err) => {
      _drivers = null
      driversObj.close()
      reject(err)
    }
    _validateConnection(driver, myResolve, myReject)
  })
  return p
}

function _trackedTransaction (input, parameters = {}, session, requestId = null) {
  const id = requestId || v4()
  if (!session) {
    return [id, Promise.reject(new BoltConnectionError())]
  }
  const closeFn = (cb = () => {}) => {
    session.close(cb)
    if (runningQueryRegister[id]) delete runningQueryRegister[id]
  }
  runningQueryRegister[id] = closeFn
  const queryPromise = session.run(input, parameters)
    .then((r) => {
      closeFn()
      return r
    })
    .catch((e) => {
      closeFn()
      throw e
    })
  return [id, queryPromise]
}

function cancelTransaction (id, cb) {
  if (runningQueryRegister[id]) runningQueryRegister[id](cb)
}

function _transaction (input, parameters, session) {
  if (!session) return Promise.reject(new BoltConnectionError())
  return session.run(input, parameters)
    .then((r) => {
      session.close()
      return r
    })
    .catch((e) => {
      session.close()
      throw e
    })
}

function directTransaction (input, parameters, requestId = null, cancelable = false) {
  const session = _drivers ? _drivers.getDirectDriver().session() : false
  if (!cancelable) return _transaction(input, parameters, session)
  return _trackedTransaction(input, parameters, session, requestId)
}

function routedReadTransaction (input, parameters, requestId = null, cancelable = false) {
  const session = _drivers ? _drivers.getRoutedDriver().session(neo4j.session.READ) : false
  if (!cancelable) return _transaction(input, parameters, session)
  return _trackedTransaction(input, parameters, session, requestId)
}

function routedWriteTransaction (input, parameters, requestId = null, cancelable = false) {
  const session = _drivers ? _drivers.getRoutedDriver().session(neo4j.session.WRITE) : false
  if (!cancelable) return _transaction(input, parameters, session)
  return _trackedTransaction(input, parameters, session, requestId)
}

export default {
  directConnect: connect,
  openConnection,
  closeConnection: () => {
    if (_drivers) _drivers.close()
  },
  directTransaction,
  routedReadTransaction,
  routedWriteTransaction,
  cancelTransaction,
  useRouting: (shouldWe) => (_useRouting = shouldWe),
  recordsToTableArray: (records) => {
    const intChecker = neo4j.isInt
    const intConverter = (val) => val.toString()
    return mappings.recordsToTableArray(records, intChecker, intConverter)
  },
  extractNodesAndRelationshipsFromRecords: (records) => {
    return mappings.extractNodesAndRelationshipsFromRecords(records, neo4j.types)
  },
  extractPlan: (result) => {
    return mappings.extractPlan(result)
  },
  neo4j: neo4j
}
