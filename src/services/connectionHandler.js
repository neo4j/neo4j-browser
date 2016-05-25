let _connections = []

function createConnectionObject (name, connection, transactionFn = () => {}) {
  return {
    name: name,
    isDefault: false,
    connection: connection,
    transaction: transactionFn(connection)
  }
}

export const open = ({name, username, password, host}, connectFn, validateFn, transactionFn) => {
  const p = new Promise((resolve, reject) => {
    const exists = _connections.filter((c) => c.name === name)
    if (exists.length) {
      return validateFn(exists[0]).then((c) => resolve(c)).catch((e) => reject(e))
    }
    connectFn({username, password, host})
      .then((c) => {
        validateFn(c).then((_) => {
          _connections.push(createConnectionObject(name, c, transactionFn))
          if (_connections.length === 1) setDefault(name)
          resolve(c)
        }).catch((e) => reject(e))
      }).catch((e) => reject(e))
  })
  return p
}

export function close (name, closeFn) {
  const connection = get(name)
  if (!connection) return
  if (closeFn) closeFn(connection.connection)
  _connections = _connections.filter((c) => c.name !== name)
  if (connection.isDefault && _connections.length) setDefault(_connections[0].name)
}

export function get (name = null) {
  const lookFor = (c) => {
    if (name) return c.name === name
    return c.isDefault
  }
  const match = _connections.filter(lookFor)
  return match.length ? match[0] : false
}

export function setDefault (name) {
  _connections = _connections.map((c) => {
    c.isDefault = false
    if (c.name === name) c.isDefault = true
    return c
  })
}

export function clearAll (closeFn) {
  _connections.forEach((c) => close(c.name, closeFn))
}
