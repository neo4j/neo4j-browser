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

import { dehydrate } from 'services/duckUtils'

export let keyPrefix = 'neo4j.'
let storage = window.localStorage
const keys = []

export function getItem(key) {
  try {
    const serializedVal = storage.getItem(keyPrefix + key)
    if (serializedVal === null) return undefined
    const parsedVal = JSON.parse(serializedVal)
    return parsedVal
  } catch (e) {
    return undefined
  }
}

export function setItem(key, val) {
  try {
    const serializedVal = JSON.stringify(val)
    storage.setItem(keyPrefix + key, serializedVal)
    return true
  } catch (e) {
    return false
  }
}

export function getAll() {
  const out = {}
  keys.forEach(key => {
    const current = getItem(key)
    if (current !== undefined) {
      if (key === 'settings') {
        const { playImplicitInitCommands, ...otherSettings } = current
        out[key] = { ...otherSettings, playImplicitInitCommands: true }
      } else {
        out[key] = current
      }
    }
  })
  return out
}

export const clear = () => storage.clear()

export function createReduxMiddleware() {
  return store => next => action => {
    const result = next(action)
    const state = store.getState()
    keys.forEach(key => setItem(key, dehydrate(state[key])))
    return result
  }
}

export function applyKeys() {
  Array.from(arguments).forEach(arg => keys.push(arg))
}
export const setPrefix = p => (keyPrefix = p)
export const setStorage = s => (storage = s)
