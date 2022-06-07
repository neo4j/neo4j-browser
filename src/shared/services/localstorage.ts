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
import { debounce } from 'lodash-es'
import { Middleware } from 'redux'

import {
  shouldRetainConnectionCredentials,
  shouldRetainEditorHistory
} from '../modules/dbMeta/dbMetaDuck'
import { initialState as settingsInitialState } from '../modules/settings/settingsDuck'
import { GlobalState } from 'shared/globalState'

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
const keys: LocalStorageKey[] = []

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

function storeReduxInLocalStorage(state: GlobalState) {
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
}

const debouncedStore = debounce(storeReduxInLocalStorage, 500, {
  trailing: true,
  maxWait: 1000
})

export function createReduxMiddleware(): Middleware {
  return store => next => action => {
    const result = next(action)
    const state = store.getState() as unknown as GlobalState
    debouncedStore(state)

    return result
  }
}

export function applyKeys(...newKeys: LocalStorageKey[]): void {
  keys.push(...newKeys)
}
export const setStorage = (s: Storage): void => {
  storage = s
}
