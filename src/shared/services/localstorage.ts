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
import { Middleware } from 'redux'

import {
  shouldRetainConnectionCredentials,
  shouldRetainEditorHistory
} from '../modules/dbMeta/state'
import { loadSettingsFromStorage } from '../modules/settings/settingsDuck'
import { GlobalState } from 'shared/globalState'
import { getConnectionsFromLocalStorage } from 'shared/modules/connections/connectionsDuck'
import { loadExperimentalFeaturesFromStorage } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import { loadFavoritesFromStorage } from 'shared/modules/favorites/favoritesDuck'
import { loadFoldersFromStorage } from 'shared/modules/favorites/foldersDuck'
import { loadGrassFromStorage } from 'shared/modules/grass/grassDuck'
import { loadGuidesFromStorage } from 'shared/modules/guides/guidesDuck'
import { loadHistoryFromStorage } from 'shared/modules/history/historyDuck'
import { loadSyncConsentFromStorage } from 'shared/modules/sync/syncDuck'
import { loadUdcFromStorage } from 'shared/modules/udc/udcDuck'

export const keyPrefix = 'neo4j.'
let storage = window.localStorage

export type LocalStorageKey =
  | 'connections'
  | 'settings'
  | 'history'
  | 'documents'
  | 'folders'
  | 'grass'
  | 'syncConsent'
  | 'udc'
  | 'experimentalFeatures'
  | 'guides'
const overrideKeys: LocalStorageKey[] = []
const defaultKeys: LocalStorageKey[] = [
  'connections',
  'settings',
  'history',
  'documents',
  'folders',
  'grass',
  'syncConsent',
  'udc',
  'experimentalFeatures',
  'guides'
]
type LocalStorageState = Pick<GlobalState, LocalStorageKey>

export function getItem(key: LocalStorageKey): any {
  try {
    const serializedVal = storage.getItem(keyPrefix + key)
    if (serializedVal === null) return undefined
    const parsedVal = JSON.parse(serializedVal)
    return parsedVal
  } catch (e) {
    return undefined
  }
}

export function setItem(key: string, val: unknown): boolean {
  try {
    const serializedVal = JSON.stringify(val)
    storage.setItem(keyPrefix + key, serializedVal)
    return true
  } catch (e) {
    return false
  }
}
export function getAll(): LocalStorageState {
  // each reducer loads and verifies the localstorage state
  return {
    connections: getConnectionsFromLocalStorage(getItem('connections')),
    settings: loadSettingsFromStorage(getItem('settings')),
    history: loadHistoryFromStorage(getItem('history')),
    documents: loadFavoritesFromStorage(getItem('documents')),
    folders: loadFoldersFromStorage(getItem('folders')),
    grass: loadGrassFromStorage(getItem('grass')),
    syncConsent: loadSyncConsentFromStorage(getItem('syncConsent')),
    udc: loadUdcFromStorage(getItem('udc')),
    experimentalFeatures: loadExperimentalFeaturesFromStorage(
      getItem('experimentalFeatures')
    ),
    guides: loadGuidesFromStorage(getItem('guides'))
  }
}

export function createReduxMiddleware(): Middleware {
  return store => next => action => {
    const result = next(action)
    const state = store.getState() as unknown as GlobalState
    const keys = overrideKeys.length > 0 ? overrideKeys : defaultKeys

    keys.forEach(key => {
      if (key === 'connections' && !shouldRetainConnectionCredentials(state)) {
        // if browser.retain_connection_credentials is not true, overwrite password value on all connections
        setItem(key, {
          ...state[key],
          connectionsById: Object.assign(
            {},
            ...Object.entries(state[key].connectionsById).map(
              ([id, connection]) => ({
                [id]: {
                  ...(connection as Record<string, unknown>),
                  password: ''
                }
              })
            )
          )
        })
      } else if (key === 'history' && !shouldRetainEditorHistory(state)) {
        setItem(key, [])
      } else if (key === 'documents') {
        setItem(
          key,
          state[key].filter(fav => !fav.isStatic)
          // store only user defined favorites
        )
      } else if (key === 'guides') {
        setItem(key, { ...state[key], currentGuide: null })
      } else {
        setItem(key, state[key])
      }
    })
    return result
  }
}

export function applyKeys(...newKeys: LocalStorageKey[]): void {
  overrideKeys.push(...newKeys)
}
export const setStorage = (s: Storage): void => {
  storage = s
}
