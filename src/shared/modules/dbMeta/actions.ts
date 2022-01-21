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
  FETCH_SERVER_INFO,
  FORCE_FETCH,
  PARSE_META,
  UPDATE_META,
  UPDATE_SERVER,
  UPDATE_SETTINGS
} from './constants'
import { extractServerInfo } from './utils'

export function updateMeta(meta: any, context?: any) {
  return {
    type: PARSE_META,
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
    type: UPDATE_META,
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
