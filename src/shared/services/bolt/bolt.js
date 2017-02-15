import { v1 as neo4j } from 'neo4j-driver-alias'
import * as connectionHandler from '../connectionHandler'
import * as mappings from './boltMappings'
import { ConnectionException } from '../exceptions'

function openConnection ({id, name, username, password, host}) {
  const transactionFn = (connection) => {
    return (input, parameters) => {
      return transaction(connection, input, parameters)
    }
  }
  return connectionHandler.open({id, name, username, password, host}, connect, validateConnection, transactionFn)
}

function connect (props) {
  const p = new Promise((resolve, reject) => {
    const driver = neo4j.driver(props.host, neo4j.auth.basic(props.username, props.password))
    const tmp = driver.session()
    tmp.run('CALL db.labels()').then(() => resolve(driver)).catch((e) => reject(e))
  })
  return p
}

function validateConnection (connection) {
  const p = new Promise((resolve, reject) => {
    const tmp = connection.session()
    tmp.run('CALL db.labels()').then(() => {
      resolve(connection)
      tmp.close()
    }).catch((e) => reject(e))
  })
  return p
}

function transaction (connection, input, parameters) {
  const session = connection.session()
  return session.run(input, parameters).then((r) => {
    session.close()
    return r
  })
}

function connectToConnection (connectionData) {
  const openCon = (connection, res, rej) => {
    openConnection(connection)
    .then(res).catch(rej)
  }
  const p = new Promise((resolve, reject) => {
    const connection = connectionHandler.get(connectionData.name)
    if (connection) {
      validateConnection(connection).then((result) => {
        resolve(result)
      }).catch((e) => {
        openCon(connectionData, resolve, reject)
      })
    } else {
      openCon(connectionData, resolve, reject)
    }
  })
  return p
}

export default {
  connectToConnection,
  openConnection,
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
    const intChecker = neo4j.v1.isInt
    const intConverter = (val) => val.toString()
    return mappings.extractNodesAndRelationshipsFromRecords(records, neo4j.v1.types, intChecker,intConverter )
  },
  extractPlan: (result) => {
    return mappings.extractPlan(result)
  },
  neo4j: neo4j
}
