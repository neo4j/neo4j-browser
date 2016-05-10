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

export default {
  transaction,
  getInstance
}
