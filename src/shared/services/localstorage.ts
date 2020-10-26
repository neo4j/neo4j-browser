/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { shouldRetainConnectionCredentials } from '../modules/dbMeta/dbMetaDuck'
import { GlobalState } from '../modules/stream/streamDuck'

export const keyPrefix = 'neo4j.'
let storage = window.localStorage
const keys: string[] = []

export function getItem(key: string): Record<string, unknown> | undefined {
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

export function getAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  keys.forEach(key => {
    const current = getItem(key)
    if (current !== undefined) {
      if (key === 'settings') {
        out[key] = { ...current, playImplicitInitCommands: true }
      } else {
        out[key] = current
      }
    }
  })
  return out
}

export function createReduxMiddleware(): Middleware {
  return store => next => action => {
    const result = next(action)
    const state = (store.getState() as unknown) as GlobalState

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
      } else {
        setItem(key, state[key])
      }
    })
    return result
  }
}

export function applyKeys(...newKeys: string[]): void {
  keys.push(...newKeys)
}
export const setStorage = (s: Storage): void => {
  storage = s
}
