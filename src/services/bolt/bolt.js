/* global neo4j */
import * as connectionHandler from '../connectionHandler'
import * as mappings from './boltMappings'

function openConnection ({name, username, password, host}) {
  const transactionFn = (connection) => {
    return (input, parameters) => {
      transaction(connection, input, parameters)
    }
  }
  return connectionHandler.open({name, username, password, host}, connect, validateConnection, transactionFn)
}

function connect (props) {
  const p = new Promise((resolve, reject) => {
    const driver = neo4j.v1.driver('bolt://' + props.host, neo4j.v1.auth.basic(props.username, props.password))
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
  return session.run(input, parameters).then((_) => session.close())
}

export default {
  openConnection,
  getConnection: connectionHandler.get,
  transaction: (input, parameters) => {
    return connectionHandler.get().transaction(input, parameters)
  },
  recordsToTableArray: (records) => {
    const intChecker = neo4j.v1.isInt
    const intConverter = (val) => val.toString()
    return mappings.recordsToTableArray(records, intChecker, intConverter)
  },
  neo4j: neo4j.v1
}
