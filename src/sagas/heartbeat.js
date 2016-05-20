import { call, put } from 'redux-saga/effects'
import bolt from '../services/bolt'
import dbInfo from '../sidebar/dbInfo'

const delay = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

const metaQuery = `CALL db.labels() YIELD label
            WITH COLLECT(label) AS labels
            RETURN 'labels' as a, labels as result
            UNION
            CALL db.relationshipTypes() YIELD relationshipType
            WITH COLLECT(relationshipType) AS relationshipTypes
            RETURN 'relationshipTypes'as a, relationshipTypes as result
            UNION
            CALL db.propertyKeys() YIELD propertyKey
            WITH COLLECT(propertyKey) AS propertyKeys
            RETURN 'propertyKeys' as a, propertyKeys as result`

function * startHeartbeat () {
  while (true) {
    try {
      const res = yield call(bolt.transaction, metaQuery)
      yield put(dbInfo.actions.updateMeta(res))
    } catch (e) {
      console.log(e)
    }

    // throttle by 500ms
    yield call(delay, 10000)
  }
}

export {startHeartbeat, metaQuery}
