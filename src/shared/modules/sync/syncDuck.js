import { syncResourceFor } from 'services/browserSyncService'
import { setItem } from 'services/localstorage'
import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'sync'
export const SET_SYNC = 'sync/SET_SYNC'
export const SYNC_ITEMS = 'sync/SYNC_ITEMS'
export const CLEAR_SYNC = 'sync/CLEAR_SYNC'
export const CLEAR_SYNC_AND_LOCAL = 'sync/CLEAR_SYNC_AND_LOCAL'

/**
 * Selectors
*/
export function getSync (state) {
  return state[NAME]
}

/**
 * Reducer
*/
export default function reducer (state = null, action) {
  switch (action.type) {
    case SET_SYNC:
      return Object.assign({}, state, action.obj)
    case CLEAR_SYNC:
    case CLEAR_SYNC_AND_LOCAL:
      return null
    default:
      return state
  }
}

// Action creators
export function setSync (obj) {
  return {
    type: SET_SYNC,
    obj
  }
}

export function syncItems (itemKey, items) {
  return {
    type: SYNC_ITEMS,
    itemKey,
    items
  }
}

export function clearSync () {
  return {
    type: CLEAR_SYNC
  }
}

export function clearSyncAndLocal () {
  return {
    type: CLEAR_SYNC_AND_LOCAL
  }
}

export const syncItemsEpic = (action$, store) =>
  action$.ofType(SYNC_ITEMS)
    .do((action) => {
      const userId = store.getState().sync.key
      syncResourceFor(userId, action.itemKey, action.items)
    })
    .mapTo({ type: 'NOOP' })

export const clearSyncEpic = (action$, store) =>
  action$.ofType(CLEAR_SYNC_AND_LOCAL)
    .do((action) => {
      setItem('documents', null)
      setItem('folders', null)
    })
    .mapTo({ type: USER_CLEAR })
