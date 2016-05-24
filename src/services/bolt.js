/* global neo4j */
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
    if (exists.length)
      return validateConnection(exists[0]).then((c) => resolve(c)).catch((e) => reject(e))
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
  return session.run(input, parameters)
}

function recordsToTableArray (records) {
  const recordValues = records.map((record) => {
    let out = []
    record.forEach((val, key) => out.push(itemIntToString(val)))
    return out
  })
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

function itemIntToString (item) {
  if (Array.isArray(item)) return arrayIntToString(item)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (neo4j.v1.isInt(item)) return item.toString()
  if (typeof item === 'object') return objIntToString(item)
}

function arrayIntToString (arr) {
  return arr.map((item) => itemIntToString(item))
}

function objIntToString (obj) {
  Object.keys(obj).forEach((key) => {
    obj[key] = itemIntToString(obj[key])
  })
  return obj
}

export default {
  getConnection,
  setDefaultConnection,
  openConnection,
  recordsToTableArray,
  neo4j: neo4j.v1
}
