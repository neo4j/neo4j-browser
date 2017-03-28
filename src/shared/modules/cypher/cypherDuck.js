import Rx from 'rxjs'

import bolt from 'services/bolt/bolt'

const NAME = 'cypher'
export const CYPHER_REQUEST = NAME + '/REQUEST'
export const FORCE_CHANGE_PASSWORD = NAME + '/FORCE_CHANGE_PASSWORD'

// Helpers
const changePassword = (driver, resolve, action) => {
  const session = driver.session()
  session.run(action.query, action.parameters)
    .then((r) => {
      driver.close()
      resolve({type: action._responseChannel, success: true, result: r})
    })
    .catch((e) => {
      driver.close()
      resolve(({type: action._responseChannel, success: false, error: e}))
    })
}

// Epics
export const cypherRequestEpic = (some$, store) =>
  some$.ofType(CYPHER_REQUEST)
    .mergeMap((action) => {
      if (!action._responseChannel) return Rx.Observable.of(null)
      return bolt.directTransaction(action.query, (action.params || undefined))
        .then((r) => ({type: action._responseChannel, success: true, result: r}))
        .catch((e) => ({type: action._responseChannel, success: false, error: e}))
    })

// We need this because this is the only case where we still
// want to execute cypher even though we get an connection error back
export const handleForcePasswordChangeEpic = (some$, store) =>
  some$.ofType(FORCE_CHANGE_PASSWORD)
    .mergeMap((action) => {
      if (!action._responseChannel) return Rx.Observable.of(null)
      return new Promise((resolve, reject) => {
        bolt.directConnect(action)
          .then((driver) => {
            changePassword(driver, resolve, action)
          })
          .catch(([e, driver]) => changePassword(driver, resolve, action))
      })
    })
