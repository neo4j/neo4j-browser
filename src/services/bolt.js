/* global neo4j */
import * as mappings from './boltMappings'
let connections = []

function createConnectionObject (name, connection) {
  return {
    name: name,
    isDefault: false,
    connection: connection,
    transaction: ((_connection) => {
      return (input, parameters) => transaction(_connection, input, parameters)
    })(connection)
  }
}

const openConnection = ({name, username, password, host}) => {
  const p = new Promise((resolve, reject) => {
    const exists = connections.filter((c) => c.name === name)
    if (exists.length) {
      return validateConnection(exists[0]).then((c) => resolve(c)).catch((e) => reject(e))
    }
    connect({username, password, host})
      .then((c) => {
        validateConnection(c).then((_) => {
          connections.push(createConnectionObject(name, c))
          if (connections.length === 1) setDefaultConnection(name)
          resolve(c)
        }).catch((e) => reject(e))
      }).catch((e) => reject(e))
  })
  return p
}

function closeConnection (name) {
  const connection = getConnection(name)
  if (!connection.length) return
  connection.connection.close()
  connections = connections.filter((c) => c.name !== name)
  if (connection.isDefault && connections.length) connections[0].isDefault = true
}

function getConnection (name = null) {
  const lookFor = (c) => {
    if (name) return c.name === name
    return c.isDefault
  }
  const match = connections.filter(lookFor)
  return match ? match[0] : false
}

function setDefaultConnection (name) {
  connections = connections.map((c) => {
    c.isDefault = false
    if (c.name === name) c.isDefault = true
    return c
  })
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
    tmp.run('CALL db.labels()').then(() => resolve(connection)).catch((e) => reject(e))
  })
  return p
}

function transaction (connection, input, parameters) {
  const session = connection.session()
  return session.run(input, parameters).then((_) => session.close())
}

export default {
  getConnection,
  setDefaultConnection,
  openConnection,
  closeConnection,
  transaction: (input, parameters) => {
    return getConnection().transaction(input, parameters)
  },
  recordsToTableArray: (records) => {
    const intChecker = neo4j.v1.isInt
    const intConverter = (val) => val.toString()
    return mappings.recordsToTableArray(records, intChecker, intConverter)
  },
  neo4j: neo4j.v1
}
