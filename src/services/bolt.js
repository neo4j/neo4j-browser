/* global neo4j */
let _driver = null

function connect (cb) {
  const driver = neo4j.v1.driver('bolt://localhost', neo4j.v1.auth.basic('neo4j', '.'))
  _driver = driver
  cb(driver)
}

function getInstance () {
  const p = new Promise((resolve, reject) => {
    if (_driver) {
      return resolve(_driver)
    }
    connect((driver) => {
      resolve(driver)
    })
  })
  return p
}

function transaction (input, parameters) {
  return getInstance().then((driver) => {
    const session = driver.session()
    return session.run(input, parameters)
  })
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
  transaction,
  getInstance,
  recordsToTableArray,
  neo4j: neo4j.v1
}
