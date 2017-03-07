export let keyPrefix = 'neo4j.'
let storage = window.localStorage
let keys = []

export function getItem (key) {
  try {
    const serializedVal = storage.getItem(keyPrefix + key)
    if (serializedVal === null) return undefined
    const parsedVal = JSON.parse(serializedVal)
    return parsedVal
  } catch (e) {
    return undefined
  }
}

export function setItem (key, val) {
  try {
    const serializedVal = JSON.stringify(val)
    storage.setItem(keyPrefix + key, serializedVal)
    return true
  } catch (e) {
    return false
  }
}

export function getAll () {
  let out = {}
  keys.forEach((key) => {
    let current = getItem(key)
    if (current !== undefined) {
      out[key] = current
    }
  })
  return out
}

export const clear = () => storage.clear()

export function createReduxMiddleware () {
  return (store) => (next) => (action) => {
    const result = next(action)
    const state = store.getState()
    keys.forEach((key) => setItem(key, state[key]))
    return result
  }
}

export function applyKeys () {
  Array.from(arguments).forEach((arg) => (keys.push(arg)))
}
export const setPrefix = (p) => (keyPrefix = p)
export const setStorage = (s) => (storage = s)
