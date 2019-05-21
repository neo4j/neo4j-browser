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

import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { APP_START } from 'shared/modules/app/appDuck'
import {
  CONNECTION_SUCCESS,
  DISCONNECTION_SUCCESS
} from 'shared/modules/connections/connectionsDuck'
import { getBackgroundTxMetadata } from 'shared/services/bolt/txMetadata'
import {
  canSendTxMetadata,
  getShowCurrentUserProcedure
} from '../features/versionedFeatures'
import { DB_META_DONE } from '../dbMeta/dbMetaDuck'

export const NAME = 'user'
export const UPDATE_CURRENT_USER = NAME + '/UPDATE_CURRENT_USER'
export const FORCE_FETCH = NAME + '/FORCE_FETCH'
export const CLEAR = NAME + '/CLEAR'

const initialState = {
  username: '',
  roles: []
}

/**
 * Selectors
 */

export function getCurrentUser (state) {
  return state[NAME]
}

/**
 * Reducer
 */
export default function user (state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case CLEAR:
      return { ...initialState }
    case UPDATE_CURRENT_USER:
      const { username, roles } = action
      return { username, roles }
    default:
      return state
  }
}

// actions
export function updateCurrentUser (username, roles) {
  return {
    type: UPDATE_CURRENT_USER,
    username,
    roles
  }
}

export function forceFetch () {
  return {
    type: FORCE_FETCH
  }
}

// Epics
export const getCurrentUserEpic = (some$, store) =>
  some$
    .ofType(CONNECTION_SUCCESS)
    .merge(some$.ofType(DB_META_DONE))
    .mergeMap(() => {
      return Rx.Observable.fromPromise(
        bolt.directTransaction(
          getShowCurrentUserProcedure(store.getState()),
          {},
          {
            useCypherThread: shouldUseCypherThread(store.getState()),
            ...getBackgroundTxMetadata({
              hasServerSupport: canSendTxMetadata(store.getState())
            })
          }
        )
      )
        .catch(() => Rx.Observable.of(null))
        .map(result => {
          if (!result) return { type: CLEAR }
          const keys = result.records[0].keys

          const username = keys.includes('username')
            ? result.records[0].get('username')
            : '-'
          const roles = keys.includes('roles')
            ? result.records[0].get('roles')
            : ['admin']

          return updateCurrentUser(username, roles)
        })
    })

export const clearCurrentUserOnDisconnectEpic = (some$, store) =>
  some$.ofType(DISCONNECTION_SUCCESS).mapTo({ type: CLEAR })
