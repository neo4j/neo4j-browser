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

import {
  UPDATE_META,
  FORCE_FETCH,
  FETCH_SERVER_INFO,
  UPDATE,
  UPDATE_SETTINGS,
  UPDATE_SERVER
} from './constants'
import { extractServerInfo } from './dbMeta.utils'

export function updateMeta(meta: any, context?: any) {
  return {
    type: UPDATE_META,
    meta,
    context
  }
}

export function fetchMetaData() {
  return {
    type: FORCE_FETCH
  }
}

export function fetchServerInfo() {
  return {
    type: FETCH_SERVER_INFO
  }
}

export const update = (obj: any) => {
  return {
    type: UPDATE,
    ...obj
  }
}

export const updateSettings = (settings: any) => {
  return {
    type: UPDATE_SETTINGS,
    settings
  }
}

export const updateServerInfo = (res: any) => {
  const extrated = extractServerInfo(res)
  return {
    ...extrated,
    type: UPDATE_SERVER
  }
}
