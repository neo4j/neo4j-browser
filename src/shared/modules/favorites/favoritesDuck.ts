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
import uuid from 'uuid'

import { scripts as staticScriptsList } from './staticScripts'
import { getBrowserName } from 'services/utils'
import {
  APP_START,
  AppStartAction,
  USER_CLEAR,
  UserClearAction
} from 'shared/modules/app/appDuck'

export const NAME = 'documents'

export const ADD_FAVORITE = 'favorites/ADD_FAVORITE'
export const REMOVE_FAVORITE = 'favorites/REMOVE_FAVORITE'
export const REMOVE_FAVORITES = 'favorites/REMOVE_FAVORITES'
export const LOAD_FAVORITES = 'favorites/LOAD_FAVORITES'
export const SYNC_FAVORITES = 'favorites/SYNC_FAVORITES'
export const UPDATE_FAVORITE_CONTENT = 'favorites/UPDATE_FAVORITE_CONTENT'
export const MOVE_FAVORITE = 'favorites/MOVE_FAVORITES'
export const RENAME_FAVORITE = 'favorites/RENAME_FAVORITES'
export const UPDATE_FAVORITES = 'favorites/UPDATE_FAVORITES'

type FavoriteAction =
  | AppStartAction
  | UserClearAction
  | AddFavoriteAction
  | RemoveFavoriteAction
  | LoadFavoritesAction
  | RemoveFavoriteAction
  | RemoveFavoritesAction
  | UpdateFavoriteContentAction
  | SyncFavoriteAction
  | MoveFavoriteAction
  | RenameFavoriteAction
  | UpdateFavoriteAction

export const getFavorites = (state: any): Favorite[] => state[NAME]
export const getFavorite = (state: any, id: string): Favorite | undefined =>
  state.find((favorite: any) => favorite.id === id)

const versionSize = 20

export type Favorite = {
  id?: string // Missing in static scripts
  content: string
  folder?: string // missing if in root
  not_executable?: boolean
  isStatic?: boolean
  versionRange?: string
}

// reducer
const initialState: Favorite[] = staticScriptsList.map(script => ({
  ...script,
  isStatic: true
}))

const removeFavoriteById = (state: any, id: any) =>
  state.filter((favorite: any) => favorite.id !== id)
const removeFavoritesById = (state: any, ids: any) =>
  state.filter((favorite: any) => !ids.includes(favorite.id))

export default function reducer(
  state: Favorite[] = initialState,
  action: FavoriteAction
): Favorite[] {
  switch (action.type) {
    case REMOVE_FAVORITE:
      return removeFavoriteById(state, action.id)
    case REMOVE_FAVORITES:
      return removeFavoritesById(state, action.ids)
    case ADD_FAVORITE:
      return state.concat([{ id: action.id || uuid.v4(), content: action.cmd }])
    case MOVE_FAVORITE:
      const updatedFavorites = updateFavoriteFields(state, action.id, {
        folder: action.folder
      })
      return mergeFavorites(initialState, updatedFavorites)
    case RENAME_FAVORITE:
      const fav = getFavorite(state, action.id)
      if (!fav) {
        return state
      }

      const newContent = contentWithNewName(fav, action.name)
      const updated = updateFavoriteFields(state, action.id, {
        content: newContent
      })

      return mergeFavorites(initialState, updated)
    case UPDATE_FAVORITE_CONTENT:
      return mergeFavorites(
        initialState,
        updateFavoriteFields(state, action.id, {
          content: action.cmd
        })
      )
    case LOAD_FAVORITES:
    case UPDATE_FAVORITES:
      return mergeFavorites(action.favorites, state)
    case USER_CLEAR:
      return initialState
    case APP_START:
      return mergeFavorites(initialState, state)
    default:
      return state
  }
}

type RemoveFavoriteAction = {
  type: typeof REMOVE_FAVORITE
  id: string
}
export function removeFavorite(id: string): RemoveFavoriteAction {
  return {
    type: REMOVE_FAVORITE,
    id
  }
}

type RemoveFavoritesAction = {
  type: typeof REMOVE_FAVORITES
  ids: string[]
}
export function removeFavorites(ids: string[]): RemoveFavoritesAction {
  return {
    type: REMOVE_FAVORITES,
    ids
  }
}
type AddFavoriteAction = {
  type: typeof ADD_FAVORITE
  cmd: string
  id?: string
}
export function addFavorite(cmd: string, id?: string): AddFavoriteAction {
  return {
    type: ADD_FAVORITE,
    cmd,
    id
  }
}

type LoadFavoritesAction = {
  type: typeof LOAD_FAVORITES
  favorites: Favorite[]
}
export function loadFavorites(favorites: Favorite[]): LoadFavoritesAction {
  return {
    type: LOAD_FAVORITES,
    favorites
  }
}

type SyncFavoriteAction = { type: typeof SYNC_FAVORITES; favorites: Favorite[] }
export function syncFavorites(favorites: Favorite[]): SyncFavoriteAction {
  return {
    type: SYNC_FAVORITES,
    favorites
  }
}
type UpdateFavoriteContentAction = {
  type: typeof UPDATE_FAVORITE_CONTENT
  id: string
  cmd: string
}
export function updateFavoriteContent(
  id: string,
  cmd: string
): UpdateFavoriteContentAction {
  return {
    type: UPDATE_FAVORITE_CONTENT,
    id,
    cmd
  }
}
type MoveFavoriteAction = {
  type: typeof MOVE_FAVORITE
  id: string
  folder?: string
}
export function moveFavorite(id: string, folder?: string): MoveFavoriteAction {
  return {
    type: MOVE_FAVORITE,
    id,
    folder
  }
}

type RenameFavoriteAction = {
  type: typeof RENAME_FAVORITE
  id: string
  name: string
}
export function renameFavorite(id: string, name: string): RenameFavoriteAction {
  return {
    type: RENAME_FAVORITE,
    id,
    name
  }
}

type UpdateFavoriteAction = {
  type: typeof UPDATE_FAVORITES
  favorites: Favorite[]
}
export function updateFavorites(favorites: Favorite[]): UpdateFavoriteAction {
  return {
    type: UPDATE_FAVORITES,
    favorites
  }
}

export const composeDocumentsToSync = (store: any, syncValue: any) => {
  const documents = syncValue.syncObj.documents || []
  const favorites = getFavorites(store.getState()).filter(
    (fav: any) => !fav.isStatic
  )

  const newDocuments = [
    {
      client: getBrowserName(),
      data: favorites,
      syncedAt: Date.now()
    }
  ].concat(documents.slice(0, versionSize))

  return newDocuments
}

export const mergeFavorites = (
  list1: Favorite[],
  list2: Favorite[]
): Favorite[] => {
  return list1.concat(
    list2.filter(
      (favInList2: any) =>
        list1.findIndex((favInList1: any) => favInList1.id === favInList2.id) <
        0
    )
  )
}

export const favoritesToLoad = (action: any, store: any) => {
  const favoritesFromSync =
    action.obj.syncObj && action.obj.syncObj.documents.length > 0
      ? action.obj.syncObj.documents[0].data || []
      : null

  if (favoritesFromSync) {
    const existingFavs = getFavorites(store.getState())
    const allFavorites = mergeFavorites(favoritesFromSync, existingFavs)

    if (
      existingFavs.every(
        (exFav: any) =>
          exFav.isStatic ||
          favoritesFromSync.findIndex(
            (syncFav: any) => syncFav.id === exFav.id
          ) >= 0
      )
    ) {
      return {
        favorites: allFavorites,
        syncFavorites: false,
        loadFavorites: true
      }
    } else {
      return {
        favorites: allFavorites,
        syncFavorites: true,
        loadFavorites: true
      }
    }
  } else {
    return { favorites: null, syncFavorites: false, loadFavorites: false }
  }
}

function updateFavoriteFields(
  state: Favorite[],
  id: string,
  updates: Partial<Favorite>
): Favorite[] {
  const fav = getFavorite(state, id)
  if (!fav) {
    return state
  }

  const mergedFavorite: Favorite = {
    ...fav,
    ...updates
  }
  return state.map(fav => (fav.id === id ? mergedFavorite : fav))
}

function contentWithNewName(script: Favorite, newName: string): string {
  // Name of favorite is the comment on the first line by convention
  const [nameLine, ...NonNamecontents] = script.content.split('\n')
  const alreadyHasName = nameLine.startsWith('//')
  return alreadyHasName
    ? `//${newName}
${NonNamecontents.join('\n')}`
    : `//${newName}
${script.content}`
}
