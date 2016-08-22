import { call, put, select } from 'redux-saga/effects'
import bolt from 'services/bolt/bolt'
import { updateMeta } from './actions'
import bookmarks from 'containers/bookmarks'

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
      const context = yield select(bookmarks.selectors.getActiveBookmark)
      const res = yield call(bolt.transaction, metaQuery)
      yield put(updateMeta(res, context))
    } catch (e) {
      console.log(e)
    }

    // throttle by 500ms
    yield call(delay, 10000)
  }
}

export {startHeartbeat, metaQuery}
