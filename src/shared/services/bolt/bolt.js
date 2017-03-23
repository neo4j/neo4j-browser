import { v4 } from 'uuid'
import { v1 as neo4j } from 'neo4j-driver-alias'
import * as connectionHandler from '../connectionHandler'
import * as mappings from './boltMappings'
import { ConnectionException, BoltConnectionError } from '../exceptions'

const runningQueryRegister = {}

function openConnection ({id, name, username, password, host}, opts = {}, onLostConnection = () => {}) {
  const transactionFn = (connection) => {
    return (input, parameters) => {
      return transaction(connection, input, parameters)
    }
  }
  return connectionHandler.open({id, name, username, password, host}, opts, onLostConnection, connect, validateConnection, transactionFn)
}

function connect (props, opts = {}, onLostConnection = () => {}) {
  const p = new Promise((resolve, reject) => {
    const creds = opts.withoutCredentials || (props.username && !props.username)
      ? undefined
      : neo4j.auth.basic(props.username, props.password)
    const driver = neo4j.driver(props.host, creds)
    driver.onError = (e) => {
      onLostConnection(e)
      reject([e, driver])
    }
    const tmp = driver.session()
    tmp.run('CALL db.labels()').then(() => resolve(driver)).catch((e) => reject([e, driver]))
  })
  return p
}

function validateConnection (connection) {
  const p = new Promise((resolve, reject) => {
    if (!connection || !connection.session) return reject('No connection')
    const tmp = connection.session()
    tmp.run('CALL db.labels()').then(() => {
      resolve(connection)
      tmp.close()
    }).catch((e) => reject(e))
  })
  return p
}

function trackedTransaction (input, parameters = {}, connection = null, requestId = null) {
  connection = connection || connectionHandler.get()
  const id = requestId || v4()
  if (!connection) {
    return [id, Promise.reject(new BoltConnectionError())]
  }
  const session = connection.connection.session()
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

function transaction (connection, input, parameters) {
  const session = connection.session()
  return session.run(input, parameters).then((r) => {
    session.close()
    return r
  })
}

function connectToConnection (connectionData, opts = {}, onLostConnection) {
  const openCon = (connection, res, rej, onLostConnection) => {
    openConnection(connection, opts, onLostConnection)
    .then(res).catch(rej)
  }
  const p = new Promise((resolve, reject) => {
    const connection = connectionHandler.get(connectionData.name)
    if (connection) {
      validateConnection(connection.connection).then((result) => {
        resolve(result)
      }).catch((e) => {
        openCon(connectionData, resolve, reject, onLostConnection)
      })
    } else {
      openCon(connectionData, resolve, reject, onLostConnection)
    }
  })
  return p
}

function cancelTransaction (id, cb) {
  if (runningQueryRegister[id]) runningQueryRegister[id](cb)
}

export default {
  trackedTransaction,
  directConnect: connect,
  cancelTransaction,
  connectToConnection,
  openConnection,
  closeActiveConnection: () => {
    const c = connectionHandler.get()
    if (!c) return
    connectionHandler.close(c.name, (driver) => driver.close())
  },
  useConnection: (name) => {
    connectionHandler.setDefault(name)
  },
  getConnection: connectionHandler.get,
  transaction: (input, parameters) => {
    const c = connectionHandler.get()
    if (c) return c.transaction(input, parameters)
    return Promise.reject(new ConnectionException('No connection'))
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
