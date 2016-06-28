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

function getStorageForKeys (keys, storage = window.localStorage, customMap = null) {
  let out = {}
  keys.forEach((key) => {
    let current = getItem(key, storage)
    if (customMap) current = customMap(key, current)
    if (current !== undefined) {
      out[key] = current
    }
  })
  return out
}

function createPersistingStoreListener (store, keys, storage = window.localStorage) {
  return function () {
    const currentState = store.getState()
    return keys.forEach((key) => {
      setItem(key, currentState[key], storage)
    })
  }
}

export {
  keyPrefix,
  getItem,
  setItem,
  getStorageForKeys,
  createPersistingStoreListener
}
