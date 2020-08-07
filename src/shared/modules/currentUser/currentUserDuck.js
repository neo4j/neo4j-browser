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

import bolt from 'services/bolt/bolt'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { APP_START } from 'shared/modules/app/appDuck'
import {
  CONNECTION_SUCCESS,
  DISCONNECTION_SUCCESS,
  getAuthEnabled
} from 'shared/modules/connections/connectionsDuck'
import { getBackgroundTxMetadata } from 'shared/services/bolt/txMetadata'
import {
  canSendTxMetadata,
  getShowCurrentUserProcedure,
  FIRST_MULTI_DB_SUPPORT,
  FIRST_NO_MULTI_DB_SUPPORT
} from '../features/versionedFeatures'
import { DB_META_DONE, SYSTEM_DB } from '../dbMeta/dbMetaDuck'

export const NAME = 'user'
export const UPDATE_CURRENT_USER = `${NAME}/UPDATE_CURRENT_USER`
export const FORCE_FETCH = `${NAME}/FORCE_FETCH`
export const CLEAR = `${NAME}/CLEAR`

const initialState = {
  username: '',
  roles: []
}

/**
 * Selectors
 */

export function getCurrentUser(state) {
  return state[NAME]
}

/**
 * Reducer
 */
export default function user(state = initialState, action) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
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
export function updateCurrentUser(username, roles) {
  return {
    type: UPDATE_CURRENT_USER,
    username,
    roles
  }
}

export function forceFetch() {
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
      return new Promise(async resolve => {
        const authEnabled = getAuthEnabled(store.getState())
        if (!authEnabled) {
          return resolve(null)
        }
        const supportsMultiDb = await bolt.hasMultiDbSupport()
        bolt
          .directTransaction(
            getShowCurrentUserProcedure(
              supportsMultiDb
                ? FIRST_MULTI_DB_SUPPORT
                : FIRST_NO_MULTI_DB_SUPPORT
            ),
            {},
            {
              useCypherThread: shouldUseCypherThread(store.getState()),
              ...getBackgroundTxMetadata({
                hasServerSupport: canSendTxMetadata(store.getState())
              }),
              useDb: supportsMultiDb ? SYSTEM_DB : ''
            }
          )
          .then(res => resolve(res))
          .catch(() => resolve(null))
      })
    })
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

export const clearCurrentUserOnDisconnectEpic = (some$, store) =>
  some$.ofType(DISCONNECTION_SUCCESS).mapTo({ type: CLEAR })
