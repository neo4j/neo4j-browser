/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { combineLatest } from 'rxjs'
import { flatMap, map } from 'rxjs/operators'
import { map as _map } from 'lodash-es'

import { APP_START } from '../app/appDuck'
import * as oldFavorites from '../favorites/favoritesDuck'
import * as oldFolders from '../favorites/foldersDuck'

import { STATIC_SCRIPTS } from './user-favorites.constants'
import * as userFavoriteClient from './client'

import {
  mapOldFavoritesAndFolders,
  onlyNewFavorites
} from './user-favorites.utils'
import { arrayHasItems } from '../../../browser/modules/my-scripts/generic.utils' // @todo: generics?

export const NAME = 'user-favorites'

const SET_FAVORITES = `${NAME}/SET_FAVORITES`
const ADD_FAVORITE = `${NAME}/ADD_FAVORITE`
const FAVORITE_ADDED = `${NAME}/FAVORITE_ADDED`
const ADD_MANY_FAVORITES = `${NAME}/ADD_MANY_FAVORITES`
const MANY_FAVORITES_ADDED = `${NAME}/MANY_FAVORITES_ADDED`
const UPDATE_FAVORITE = `${NAME}/UPDATE_FAVORITE`
const FAVORITE_UPDATED = `${NAME}/FAVORITE_UPDATED`
const UPDATE_MANY_FAVORITES = `${NAME}/UPDATE_MANY_FAVORITES`
const MANY_FAVORITES_UPDATED = `${NAME}/MANY_FAVORITES_UPDATED`
const REMOVE_FAVORITE = `${NAME}/REMOVE_FAVORITE`
const FAVORITE_REMOVED = `${NAME}/FAVORITE_REMOVED`
const REMOVE_MANY_FAVORITES = `${NAME}/REMOVE_MANY_FAVORITES`
const MANY_FAVORITES_REMOVED = `${NAME}/MANY_FAVORITES_REMOVED`
const NO_OP = `${NAME}/NO_OP`

const initialState = {
  favorites: [],
  staticScripts: STATIC_SCRIPTS
}

export default function useFavoritesReducer (state = initialState, action) {
  switch (action.type) {
    case SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      }
    default:
      return state
  }
}

const noOp = () => ({
  type: NO_OP
})
const setFavorites = favorites => ({
  type: SET_FAVORITES,
  payload: favorites
})
export const addFavorite = payload => ({
  type: ADD_FAVORITE,
  payload
})
const favoriteAdded = ({ id }) => ({ type: FAVORITE_ADDED, payload: id })
export const addManyFavorites = payload => ({
  type: ADD_MANY_FAVORITES,
  payload
})
const manyFavoritesAdded = favorites => ({
  type: MANY_FAVORITES_ADDED,
  payload: _map(favorites, ({ id }) => id)
})
export const updateFavorite = payload => ({
  type: UPDATE_FAVORITE,
  payload
})
const favoriteUpdated = ({ id }) => ({ type: FAVORITE_UPDATED, payload: id })
export const updateManyFavorites = (favorites, payload) => ({
  type: UPDATE_MANY_FAVORITES,
  payload: {
    ...payload,
    scriptIds: _map(favorites, ({ id }) => id)
  }
})
const manyFavoritesUpdated = favorites => ({
  type: MANY_FAVORITES_UPDATED,
  payload: _map(favorites, ({ id }) => id)
})
export const removeFavorite = ({ id }) => ({
  type: REMOVE_FAVORITE,
  payload: { id }
})
const favoriteRemoved = id => ({ type: FAVORITE_REMOVED, payload: id })
export const removeManyFavorites = favorites => ({
  type: REMOVE_MANY_FAVORITES,
  payload: {
    scriptIds: _map(favorites, ({ id }) => id)
  }
})
const manyFavoritesRemoved = favorites => ({
  type: MANY_FAVORITES_REMOVED,
  payload: _map(favorites, ({ id }) => id)
})

export const getUserFavoritesEpic = action$ =>
  action$
    .ofType(
      APP_START,
      FAVORITE_ADDED,
      MANY_FAVORITES_ADDED,
      FAVORITE_UPDATED,
      MANY_FAVORITES_UPDATED,
      FAVORITE_REMOVED,
      MANY_FAVORITES_REMOVED
    )
    .pipe(
      flatMap(userFavoriteClient.getAllUserFavorites),
      map(setFavorites)
    )

export const addUserFavoritesEpic = action$ =>
  action$.ofType(ADD_FAVORITE).pipe(
    flatMap(({ payload }) => userFavoriteClient.createUserFavorite(payload)),
    map(favoriteAdded)
  )

export const addManyUserFavoritesEpic = action$ =>
  action$.ofType(ADD_MANY_FAVORITES).pipe(
    flatMap(({ payload }) =>
      userFavoriteClient.createManyUserFavorites(payload)
    ),
    map(manyFavoritesAdded)
  )

export const updateUserFavoritesEpic = action$ =>
  action$.ofType(UPDATE_FAVORITE).pipe(
    flatMap(({ payload }) => {
      const { id, ...data } = payload

      return userFavoriteClient.updateUserFavorite(id, data)
    }),
    map(favoriteUpdated)
  )

export const updateManyUserFavoritesEpic = action$ =>
  action$.ofType(UPDATE_MANY_FAVORITES).pipe(
    flatMap(({ payload }) => {
      const { scriptIds, ...data } = payload

      return userFavoriteClient.updateManyUserFavorites(scriptIds, data)
    }),
    map(manyFavoritesUpdated)
  )

export const removeUserFavoritesEpic = action$ =>
  action$.ofType(REMOVE_FAVORITE).pipe(
    flatMap(({ payload }) => {
      const { id } = payload

      return userFavoriteClient.removeUserFavorite(id)
    }),
    map(favoriteRemoved)
  )

export const removeManyUserFavoritesEpic = action$ =>
  action$.ofType(REMOVE_MANY_FAVORITES).pipe(
    flatMap(({ payload }) => {
      const { scriptIds } = payload

      return userFavoriteClient.removeManyUserFavorites(scriptIds)
    }),
    map(manyFavoritesRemoved)
  )

export const migrateLocalFavorites = action$ =>
  combineLatest([
    action$.ofType(oldFavorites.LOAD_FAVORITES),
    action$.ofType(oldFolders.LOAD_FOLDERS),
    action$.ofType(SET_FAVORITES)
  ]).pipe(
    map(
      ([
        { favorites: oldFavorites },
        { folders: oldFolders },
        { payload: favorites }
      ]) => [mapOldFavoritesAndFolders(oldFavorites, oldFolders), favorites]
    ),
    map(([unsavedFavorites, savedFavorites]) =>
      onlyNewFavorites(unsavedFavorites, savedFavorites)
    ),
    map(
      favoritesToCreate =>
        arrayHasItems(favoritesToCreate)
          ? addManyFavorites(favoritesToCreate)
          : noOp()
    )
  )
