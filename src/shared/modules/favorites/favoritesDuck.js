/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import { arrayHasItems } from '@relate-by-ui/saved-scripts'

import { getBrowserName } from '../../services/utils'

export const NAME = 'documents'

export const LOAD_FAVORITES = 'favorites/LOAD_FAVORITES'
export const CLEAR_OLD_FAVORITES = 'favorites/CLEAR_OLD_FAVORITES_SYNC'

export default function reducer (state = [], action) {
  switch (action.type) {
    case LOAD_FAVORITES:
      return action.favorites
    case CLEAR_OLD_FAVORITES:
      return []
    default:
      return state
  }
}

export function loadFavorites (favorites) {
  return {
    type: LOAD_FAVORITES,
    favorites
  }
}

export function clearOldFavorites () {
  return {
    type: CLEAR_OLD_FAVORITES
  }
}

export function getEmptyDocumentSyncData () {
  return [
    {
      client: getBrowserName(),
      data: [],
      syncedAt: Date.now()
    }
  ]
}

export function favoritesToLoad (action) {
  let favoritesFromSync =
    action.obj.syncObj && action.obj.syncObj.documents.length > 0
      ? action.obj.syncObj.documents[0].data || []
      : null

  return {
    favorites: arrayHasItems(favoritesFromSync) ? favoritesFromSync : []
  }
}
