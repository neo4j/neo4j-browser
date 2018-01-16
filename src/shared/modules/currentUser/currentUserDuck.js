/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'user'
export const UPDATE_CURRENT_USER = NAME + '/UPDATE_CURRENT_USER'

const initialState = {
  info: null
}

/**
 * Selectors
*/

export function getCurrentUser (state) {
  return Object.assign({}, state[NAME])
}

/**
 * Helpers
*/
function updateCurrentUserInfo (state, info) {
  return Object.assign({}, state, { info: info })
}

/**
 * Reducer
*/
export default function user (state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case UPDATE_CURRENT_USER:
      const info = action.info
      if (info) {
        return updateCurrentUserInfo(state, action.info)
      } else {
        return state
      }

    default:
      return state
  }
}

// actions
export function updateCurrentUser (username, roles) {
  return {
    type: UPDATE_CURRENT_USER,
    info: {
      username,
      roles
    }
  }
}
