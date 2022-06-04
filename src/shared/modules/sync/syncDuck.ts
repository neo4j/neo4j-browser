/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { APP_START } from 'shared/modules/app/appDuck'
import {
  ADD_FAVORITE,
  REMOVE_FAVORITE,
  SYNC_FAVORITES,
  UPDATE_FAVORITES,
  composeDocumentsToSync,
  favoritesToLoad,
  loadFavorites,
  syncFavorites
} from 'shared/modules/favorites/favoritesDuck'
import {
  ADD_FOLDER,
  REMOVE_FOLDER,
  SYNC_FOLDERS,
  UPDATE_FOLDERS,
  composeFoldersToSync,
  foldersToLoad,
  loadFolders,
  syncFolders
} from 'shared/modules/favorites/foldersDuck'
import {
  SYNC_GRASS,
  UPDATE_GRAPH_STYLE_DATA,
  composeGrassToSync,
  grassToLoad,
  syncGrass,
  updateGraphStyleData
} from 'shared/modules/grass/grassDuck'
import { CLEAR_LOCALSTORAGE } from 'shared/modules/localstorage/localstorageDuck'

export const NAME = 'sync'
export const NAME_CONSENT = 'syncConsent'
export const NAME_META = 'syncMetadata'
export const SET_SYNC_DATA = 'sync/SET_SYNC_DATA'
export const SYNC_ITEMS = 'sync/SYNC_ITEMS'
export const CLEAR_SYNC = 'sync/CLEAR_SYNC'
export const CLEAR_SYNC_AND_LOCAL = 'sync/CLEAR_SYNC_AND_LOCAL'
export const CONSENT_SYNC = 'sync/CONSENT_SYNC'
export const OPT_OUT_SYNC = 'sync/OPT_OUT_SYNC'
export const AUTHORIZED = 'sync/AUTHORIZED'
export const SET_AUTH_DATA = `${NAME_META}/SET_AUTH_DATA`
export const SET_SYNC_METADATA = `${NAME_META}/SET_SYNC_METADATA`
export const RESET_METADATA = `${NAME_META}/RESET_METADATA`
export const SERVICE_STATUS_UPDATED = `${NAME_META}/SERVICE_STATUS_UPDATED`
export const USER_AUTH_STATUS_UPDATED = `${NAME_META}/USER_AUTH_STATUS_UPDATED`

export const UP = 'UP'
export const DOWN = 'DOWN'
export const PENDING = 'PENDING'
export const UNKNOWN = 'UNKNOWN'
export const SIGNED_IN = 'SIGNED_IN'
export const SIGNED_OUT = 'SIGNED_OUT'

export const initialState: any = null
export const initialConsentState = { consented: false, optedOut: false }
export const initialMetadataState = {
  serviceStatus: UNKNOWN,
  userAuthStatus: SIGNED_OUT,
  key: null,
  lastSyncedAt: null,
  profile: null
}

/**
 * Selectors
 */
export function getSync(state: any) {
  return state[NAME]
}

export function getMetadata(state: any) {
  return state[NAME_META] || null
}

export function getServiceStatus(state: any) {
  return (state[NAME_META] || initialMetadataState).serviceStatus
}
export function getUserAuthStatus(state: any) {
  return (state[NAME_META] || {}).userAuthStatus || SIGNED_OUT
}
export function isUserSignedIn(state: any) {
  return (state[NAME_META] || {}).userAuthStatus === SIGNED_IN
}
export function getUserData(state: any) {
  return (state[NAME_META] || {}).profile
}
export function getLastSyncedAt(state: any) {
  return (
    (state[NAME_META] || {}).lastSyncedAt || initialMetadataState.lastSyncedAt
  )
}

/**
 * Reducer
 */

export function syncReducer(state = initialState, action: any) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case SET_SYNC_DATA:
      return {
        ...state,
        ...action.obj
      }
    case CLEAR_SYNC:
    case CLEAR_SYNC_AND_LOCAL:
      return null
    default:
      return state
  }
}

export function syncConsentReducer(state = initialConsentState, action: any) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case CONSENT_SYNC:
      return {
        ...state,
        consented: action.consent,
        optedOut: action.consent ? false : state.optedOut
      }
    case CLEAR_SYNC_AND_LOCAL:
      return { consented: false, optedOut: false }
    case OPT_OUT_SYNC:
      return {
        ...state,
        optedOut: true
      }
    case SET_SYNC_DATA:
      return {
        ...state,
        optedOut: false
      }
    default:
      return state
  }
}

export function syncMetaDataReducer(state = initialMetadataState, action: any) {
  switch (action.type) {
    case APP_START:
      return { ...initialMetadataState, ...state }
    case SET_AUTH_DATA:
      return {
        ...state,
        ...action.data
      }
    case SET_SYNC_METADATA:
      return {
        ...state,
        key: action.key || null,
        lastSyncedAt: action.lastSyncedAt
      }
    case SERVICE_STATUS_UPDATED:
      return { ...state, serviceStatus: action.status }
    case USER_AUTH_STATUS_UPDATED:
      return { ...state, userAuthStatus: action.status }
    case CLEAR_SYNC:
    case CLEAR_SYNC_AND_LOCAL:
    case RESET_METADATA:
      return { ...initialMetadataState, serviceStatus: state.serviceStatus }
    default:
      return state
  }
}

// Action creators
export function setSyncData(obj: any) {
  return {
    type: SET_SYNC_DATA,
    obj
  }
}

export function syncItems(itemKey: any, items: any) {
  return {
    type: SYNC_ITEMS,
    itemKey,
    items
  }
}

export const clearSync = {
  type: CLEAR_SYNC
}

export const clearSyncAndLocal = {
  type: CLEAR_SYNC_AND_LOCAL
}

export function consentSync(consent: any) {
  return {
    type: CONSENT_SYNC,
    consent
  }
}

export function optOutSync() {
  return {
    type: OPT_OUT_SYNC
  }
}

export const authorizedAs = (userData: any) => {
  return {
    type: AUTHORIZED,
    userData
  }
}

export const setSyncAuthData = (data: any) => {
  return {
    type: SET_AUTH_DATA,
    data
  }
}

export function setSyncMetadata(obj: any) {
  return {
    type: SET_SYNC_METADATA,
    ...obj
  }
}

export function resetSyncMetadata() {
  return {
    type: RESET_METADATA
  }
}

export function updateServiceStatus(status: any) {
  return {
    type: SERVICE_STATUS_UPDATED,
    status
  }
}
export function updateUserAuthStatus(status: any) {
  return {
    type: USER_AUTH_STATUS_UPDATED,
    status
  }
}

// Epics
export const syncItemsEpic = (action$: any, store: any) =>
  action$
    .ofType(SYNC_ITEMS)
    .do((action: any) => {
      const userId = store.getState().sync.key
      syncResourceFor(userId, action.itemKey, action.items)
    })
    .ignoreElements()

export const clearSyncEpic = (action$: any) =>
  action$
    .ofType(CLEAR_SYNC_AND_LOCAL)
    .do(() => {
      setItem('documents', null)
      setItem('folders', null)
      setItem('syncConsent', false)
      setItem('grass', null)
    })
    .mapTo({ type: CLEAR_LOCALSTORAGE })

export const syncFavoritesEpic = (action$: any, store: any) =>
  action$
    .filter((action: any) =>
      [
        ADD_FAVORITE,
        REMOVE_FAVORITE,
        SYNC_FAVORITES,
        UPDATE_FAVORITES
      ].includes(action.type)
    )
    .do(() => {
      const syncValue = getSync(store.getState())
      if (syncValue && syncValue.syncObj !== undefined) {
        const documents = composeDocumentsToSync(store, syncValue)
        syncItems('documents', documents)
      }
    })
    .ignoreElements()

export const loadFavoritesFromSyncEpic = (action$: any, store: any) =>
  action$
    .ofType(SET_SYNC_DATA)
    .do((action: any) => {
      const favoritesStatus = favoritesToLoad(action, store)

      if (favoritesStatus.loadFavorites && favoritesStatus.favorites) {
        store.dispatch(loadFavorites(favoritesStatus.favorites))
      }

      if (favoritesStatus.syncFavorites && favoritesStatus.favorites) {
        store.dispatch(syncFavorites(favoritesStatus.favorites))
      }
    })
    .ignoreElements()

export const loadGrassFromSyncEpic = (action$: any, store: any) =>
  action$
    .ofType(SET_SYNC_DATA)
    .do((action: any) => {
      const grass = grassToLoad(action, store)
      if (grass.loadGrass) {
        store.dispatch(updateGraphStyleData(grass.grass))
      }
      if (grass.syncGrass) {
        store.dispatch(syncGrass(grass.grass))
      }
    })
    .ignoreElements()

export const syncFoldersEpic = (action$: any, store: any) =>
  action$
    .filter((action: any) =>
      [ADD_FOLDER, REMOVE_FOLDER, SYNC_FOLDERS, UPDATE_FOLDERS].includes(
        action.type
      )
    )
    .do(() => {
      const syncValue = getSync(store.getState())

      if (syncValue && syncValue.syncObj) {
        const folders = composeFoldersToSync(store, syncValue)
        store.dispatch(syncItems('folders', folders))
      }
    })
    .ignoreElements()

export const syncGrassEpic = (action$: any, store: any) =>
  action$
    .filter((action: any) =>
      [SYNC_GRASS, UPDATE_GRAPH_STYLE_DATA].includes(action.type)
    )
    .do(() => {
      const syncValue = getSync(store.getState())

      if (syncValue && syncValue.syncObj) {
        const grass = composeGrassToSync(store, syncValue)
        store.dispatch(syncItems('grass', grass))
      }
    })
    .ignoreElements()

export const loadFoldersFromSyncEpic = (action$: any, store: any) =>
  action$
    .ofType(SET_SYNC_DATA)
    .do((action: any) => {
      const folderStatus = foldersToLoad(action, store)

      if (folderStatus.loadFolders && folderStatus.folders) {
        store.dispatch(loadFolders(folderStatus.folders))
      }

      if (folderStatus.syncFolders && folderStatus.folders) {
        store.dispatch(syncFolders(folderStatus.folders))
      }
    })
    .ignoreElements()
