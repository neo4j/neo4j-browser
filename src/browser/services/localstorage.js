const keyPrefix = 'neo4j.'

function getItem (key, storage = window.localStorage) {
  try {
    const serializedVal = storage.getItem(keyPrefix + key)
    if (serializedVal === null) return undefined
    const parsedVal = JSON.parse(serializedVal)
    return parsedVal
  } catch (e) {
    return undefined
  }
}

function setItem (key, val, storage = window.localStorage) {
  try {
    const serializedVal = JSON.stringify(val)
    storage.setItem(keyPrefix + key, serializedVal)
    return true
  } catch (e) {
    return false
  }
}

function getStorageForKeys (keys, storage = window.localStorage, middleware = null) {
  let out = {}
  keys.forEach((key) => {
    let current = getItem(key, storage)
    if (middleware) current = middleware(key, current)
    if (current !== undefined) {
      out[key] = current
    }
  })
  return out
}

function createPersistingStoreListener (store, keys, storage = window.localStorage, middleware = null) {
  return function () {
    const currentState = store.getState()
    return keys.forEach((key) => {
      let current = currentState[key]
      if (middleware) current = middleware(key, current)
      setItem(key, current, storage)
    })
  }
}

function applyMiddleware () {
  if (!arguments.length) return null
  return sequence(...arguments)
}

function sequence () {
  const composeArgs = [...arguments]
  return (key, out) => {
    composeArgs.forEach((a) => {
      out = a(key, out)
    })
    return out
  }
}

export default {
  keyPrefix,
  getItem,
  setItem,
  getStorageForKeys,
  createPersistingStoreListener,
  applyMiddleware
}
