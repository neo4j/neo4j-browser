let _connections = []

export function createConnectionObject (name, connection) {
  return {
    name: name,
    isDefault: false,
    connection: connection
  }
}

export const open = ({name, username, password, host}, connectFn, validateFn) => {
  const p = new Promise((resolve, reject) => {
    const exists = _connections.filter((c) => c.name === name)
    if (exists.length) {
      return validateFn(exists[0]).then((c) => resolve(c)).catch((e) => reject(e))
    }
    connectFn({username, password, host})
      .then((c) => {
        validateFn(c).then((_) => {
          _connections.push(createConnectionObject(name, c))
          if (_connections.length === 1) setDefault(name)
          resolve(c)
        }).catch((e) => reject(e))
      }).catch((e) => reject(e))
  })
  return p
}

export function close (name, closeFn) {
  const connection = get(name)
  if (!connection.length) return
  closeFn(connection.connection)
  _connections = _connections.filter((c) => c.name !== name)
  if (connection.isDefault && _connections.length) _connections[0].isDefault = true
}

export function get (name = null) {
  const lookFor = (c) => {
    if (name) return c.name === name
    return c.isDefault
  }
  const match = _connections.filter(lookFor)
  return match ? match[0] : false
}

export function setDefault (name) {
  _connections = _connections.map((c) => {
    c.isDefault = false
    if (c.name === name) c.isDefault = true
    return c
  })
}
