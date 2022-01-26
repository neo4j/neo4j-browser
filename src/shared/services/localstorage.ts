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
import {
  AUTO_THEME,
  LIGHT_THEME,
  SettingsState,
  initialState as settingsInitialState
} from '../modules/settings/settingsDuck'
import { GlobalState } from 'shared/globalState'
import { ConnectionReduxState } from 'shared/modules/connections/connectionsDuck'
import { ExperimentalFeaturesState } from 'shared/modules/experimentalFeatures/experimentalFeaturesDuck'
import { Favorite } from 'shared/modules/favorites/favoritesDuck'
import { Folder } from 'shared/modules/favorites/foldersDuck'
import { GrassStyleData } from 'shared/modules/grass/grassDuck'
import { GuideState } from 'shared/modules/guides/guidesDuck'
import { SyncConsentState } from 'shared/modules/sync/syncDuck'
import { UdcState } from 'shared/modules/udc/udcDuck'

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

/*
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
  */

type LocalstorageKeyToReduxShape = {
  connections: ConnectionReduxState
  settings: SettingsState
  history: string[]
  documents: Favorite[]
  folders: Folder[]
  grass: GrassStyleData
  syncConsent: SyncConsentState
  udc: UdcState
  experimentalFeatures: ExperimentalFeaturesState
  guides: Omit<GuideState, 'currentGuide'> & { currentGuide: null }
}
type d = {
  currentGuide: string | null
} & { currentGuide: null }

const LocalStorageMappers: Record = {}

export const keyPrefix = 'neo4j.'
const newKeyPrefix = 'neo4j-browser.'
let storage = window.localStorage

const keys: LocalStorageKey[] = []

type LocalStorageFormat = {
  'neo4j-browser.settings': SettingsS
}

// also cleans up
const convertFromStorage = (data: UdcStorageFormat): UdcState => data
const convertToStorage = (data: UdcState): UdcStorageFormat => data
const cleanUpStoredData = (data: UdcStorageFormat): UdcStorageFormat =>
  convertToStorage(convertFromStorage(data))
// TODO
/*
  Typa upp alla stores som inte har typer
  Be om en massa localstorages
  Skriva en massa tester (av convertFunctionerna) om hur det ska fungera
  lägg in functioner i get/setItem i localstorage.ts
  klart! 
  
  */

export function getItem(
  key: LocalStorageKey
): GlobalState[LocalStorageKey] | undefined {
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

export function getAll(): Partial<GlobalState> {
  const out: Partial<GlobalState> = {}
  keys.forEach(key => {
    const current = getItem(key)
    if (current !== undefined) {
      if (key === 'settings') {
        out[key] = {
          ...(current as typeof settingsInitialState),
          playImplicitInitCommands: true
        }
      } else {
        Object.assign(out, { [key]: current })
      }
    }
  })
  return out
}

export function createReduxMiddleware(): Middleware {
  return store => next => action => {
    const result = next(action)
    const state = store.getState() as unknown as GlobalState

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
  keys.push(...newKeys)
}
export const setStorage = (s: Storage): void => {
  storage = s
}
