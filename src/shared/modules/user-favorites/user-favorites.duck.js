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

import { flatMap, map } from 'rxjs/operators'
import { map as _map } from 'lodash-es'

import { APP_START } from '../app/appDuck'
import {
  BROWSER_FAVORITES_BASE_URL,
  STATIC_SCRIPTS
} from './user-favorites.constants'

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

// @todo: move and update these
const headers = { 'content-type': 'application/json' }

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
      flatMap(() =>
        fetch(BROWSER_FAVORITES_BASE_URL).then(_ => {
          if (!_.ok) {
            return []
          }

          return _.json()
        })
      ),
      map(setFavorites)
    )

export const addUserFavoritesEpic = action$ =>
  action$.ofType(ADD_FAVORITE).pipe(
    flatMap(({ payload }) => {
      return fetch(BROWSER_FAVORITES_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }).then(_ => _.json())
    }),
    map(favoriteAdded)
  )

export const addManyUserFavoritesEpic = action$ =>
  action$.ofType(ADD_MANY_FAVORITES).pipe(
    flatMap(({ payload }) => {
      const url = `${BROWSER_FAVORITES_BASE_URL}/bulk-create`

      return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }).then(_ => _.json())
    }),
    map(manyFavoritesAdded)
  )

export const updateUserFavoritesEpic = action$ =>
  action$.ofType(UPDATE_FAVORITE).pipe(
    flatMap(({ payload }) => {
      const { id, ...data } = payload
      const url = `${BROWSER_FAVORITES_BASE_URL}/${id}`

      return fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      }).then(_ => _.json())
    }),
    map(favoriteUpdated)
  )

export const updateManyUserFavoritesEpic = action$ =>
  action$.ofType(UPDATE_MANY_FAVORITES).pipe(
    flatMap(({ payload }) => {
      const url = `${BROWSER_FAVORITES_BASE_URL}/bulk-update`

      return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }).then(_ => _.json())
    }),
    map(manyFavoritesUpdated)
  )

export const removeUserFavoritesEpic = action$ =>
  action$.ofType(REMOVE_FAVORITE).pipe(
    flatMap(({ payload }) => {
      const url = `${BROWSER_FAVORITES_BASE_URL}/${payload.id}`

      return fetch(url, { method: 'DELETE' }).then(_ => _.json())
    }),
    map(favoriteRemoved)
  )

export const removeManyUserFavoritesEpic = action$ =>
  action$.ofType(REMOVE_MANY_FAVORITES).pipe(
    flatMap(({ payload }) => {
      const url = `${BROWSER_FAVORITES_BASE_URL}/bulk-delete`

      return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }).then(_ => _.json())
    }),
    map(manyFavoritesRemoved)
  )
