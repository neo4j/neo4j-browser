import { v4 } from 'uuid'
import { v1 as neo4j } from 'neo4j-driver-alias'
import * as mappings from './boltMappings'
import { BoltConnectionError } from '../exceptions'

let _drivers = null
const runningQueryRegister = {}

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

const getDriversObj = (props, opts = {}) => {
  const driversObj = {}
  const auth = opts.withoutCredentials || !props.username
      ? undefined
      : neo4j.auth.basic(props.username, props.password)
  return {
    getDirectDriver: () => {
      if (driversObj.direct) return driversObj.direct
      driversObj.direct = _getDriver(props.host, auth, opts, 'bolt://')
      return driversObj.direct
    },
    getRoutedDriver: () => {
      if (driversObj.routed) return driversObj.routed
      driversObj.routed = _getDriver(props.host, auth, opts, 'bolt+routing://')
      return driversObj.routed
    },
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
    const driversObj = getDriversObj(props, opts)
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

function trackedTransaction (input, parameters = {}, requestId = null) {
  const driver = _drivers.getDirectDriver()
  const id = requestId || v4()
  if (!driver) {
    return [id, Promise.reject(new BoltConnectionError())]
  }
  const session = driver.session()
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

function directTransaction (input, parameters) {
  const driver = _drivers.getDirectDriver()
  const session = driver.session()
  return session.run(input, parameters).then((r) => {
    session.close()
    return r
  })
}

export default {
  directConnect: connect,
  openConnection,
  trackedTransaction,
  cancelTransaction,
  closeActiveConnection: () => {
    if (_drivers) _drivers.close()
  },
  transaction: (input, parameters) => {
    return directTransaction(input, parameters)
  },
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
