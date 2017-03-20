let _connections = []

function createConnectionObject (id, name, connection, transactionFn = () => {}) {
  return {
    id,
    name: name,
    isDefault: false,
    connection: connection,
    transaction: transactionFn(connection)
  }
}

export const open = ({id, name, username, password, host}, opts = {}, onLostConnection = () => {}, connectFn, validateFn, transactionFn) => {
  const p = new Promise((resolve, reject) => {
    const exists = _connections.filter((c) => c.name === name)
    if (exists.length) close(name)
    connectFn({username, password, host}, opts, onLostConnection)
      .then((c) => {
        validateFn(c).then((_) => {
          _connections.push(createConnectionObject(id, name, c, transactionFn))
          if (_connections.length === 1) setDefault(name)
          resolve(c)
        }).catch((e) => reject(e))
      }).catch((e) => reject(e))
  })
  return p
}

export function close (name, closeFn = () => {}) {
  const connection = get(name)
  if (!connection) return
  if (closeFn) closeFn(connection.connection)
  _connections = _connections.filter((c) => c.name !== name)
}

export function get (name = null) {
  const lookFor = (c) => {
    if (name) return c.name === name || c.id === name
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
