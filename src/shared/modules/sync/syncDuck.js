/*
 * Copyright (c) 2002-2016 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { syncResourceFor } from 'services/browserSyncService'
import { setItem } from 'services/localstorage'
import { USER_CLEAR } from 'shared/modules/app/appDuck'
import { composeDocumentsToSync, favoritesToLoad, loadFavorites, syncFavorites, ADD_FAVORITE, REMOVE_FAVORITE, SYNC_FAVORITES } from 'shared/modules/favorites/favoritesDuck'

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

export const syncFavoritesEpic = (action$, store) =>
  action$.filter((action) => [ADD_FAVORITE, REMOVE_FAVORITE, SYNC_FAVORITES].includes(action.type))
    .map((action) => {
      const syncValue = getSync(store.getState())

      if (syncValue && syncValue.syncObj) {
        const documents = composeDocumentsToSync(store, syncValue)
        return syncItems('documents', documents)
      }
      return { type: 'NOOP' }
    })

export const loadFavoritesFromSyncEpic = (action$, store) =>
  action$.ofType(SET_SYNC)
    .do((action) => {
      const favoritesStatus = favoritesToLoad(action, store)

      if (favoritesStatus.loadFavorites) {
        store.dispatch(loadFavorites(favoritesStatus.favorites))
      }

      if (favoritesStatus.syncFavorites) {
        store.dispatch(syncFavorites(favoritesStatus.favorites))
      }
    })
    .mapTo({ type: 'NOOP' })
