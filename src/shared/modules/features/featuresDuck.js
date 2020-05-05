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

import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import { APP_START, DESKTOP, CLOUD } from 'shared/modules/app/appDuck'
import {
  CONNECTION_SUCCESS,
  DISCONNECTION_SUCCESS
} from 'shared/modules/connections/connectionsDuck'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { getBackgroundTxMetadata } from 'shared/services/bolt/txMetadata'
import { canSendTxMetadata } from '../features/versionedFeatures'
import { SYSTEM_DB } from '../dbMeta/dbMetaDuck'

export const NAME = 'features'
const CLEAR = 'features/CLEAR'
export const UPDATE_ALL_FEATURES = 'features/UPDATE_ALL_FEATURES'
export const UPDATE_USER_CAPABILITIES = 'features/UPDATE_USER_CAPABILITIES'
export const FEATURE_DETECTION_DONE = 'features/FEATURE_DETECTION_DONE'

export const getAvailableProcedures = state => state[NAME].availableProcedures
export const isACausalCluster = state =>
  getAvailableProcedures(state).includes('dbms.cluster.overview')
export const isMultiDatabase = state =>
  getAvailableProcedures(state).includes('dbms.databases.overview')
export const canAssignRolesToUser = state =>
  getAvailableProcedures(state).includes('dbms.security.addRoleToUser')
export const hasClientConfig = state =>
  getAvailableProcedures(state).includes('dbms.clientConfig')
export const useBrowserSync = state => !!state[NAME].browserSync
export const getUserCapabilities = state => state[NAME].userCapabilities

export const USER_CAPABILITIES = {
  serverConfigReadable: 'serverConfigReadable',
  proceduresReadable: 'proceduresReadable'
}

const initialState = {
  availableProcedures: [],
  browserSync: true,
  userCapabilities: {
    [USER_CAPABILITIES.serverConfigReadable]: false,
    [USER_CAPABILITIES.proceduresReadable]: false
  }
}

export default function(state = initialState, action) {
  if (action.type === APP_START) {
    state = {
      ...initialState,
      ...state,
      browserSync: shouldUseBrowserSync(action)
    }
  }

  switch (action.type) {
    case UPDATE_ALL_FEATURES:
      return { ...state, availableProcedures: [...action.availableProcedures] }
    case UPDATE_USER_CAPABILITIES:
      return {
        ...state,
        userCapabilities: {
          ...state.userCapabilities,
          [action.capabilityName]: action.capabilityValue
        }
      }
    case CLEAR:
      return initialState
    default:
      return state
  }
}

// Helper functions
const shouldUseBrowserSync = action => {
  return ![DESKTOP, CLOUD].includes(action.env)
}

// Action creators
export const updateFeatures = availableProcedures => {
  return {
    type: UPDATE_ALL_FEATURES,
    availableProcedures
  }
}

export const updateUserCapability = (capabilityName, capabilityValue) => {
  return {
    type: UPDATE_USER_CAPABILITIES,
    capabilityName,
    capabilityValue
  }
}

export const featuresDiscoveryEpic = (action$, store) => {
  return action$
    .ofType(CONNECTION_SUCCESS)
    .mergeMap(() => {
      return new Promise(async (resolve, reject) => {
        const supportsMultiDb = await bolt.hasMultiDbSupport()
        bolt
          .routedReadTransaction(
            'CALL dbms.procedures YIELD name',
            {},
            {
              useDb: supportsMultiDb ? SYSTEM_DB : '',
              useCypherThread: shouldUseCypherThread(store.getState()),
              ...getBackgroundTxMetadata({
                hasServerSupport: canSendTxMetadata(store.getState())
              })
            }
          )
          .then(resolve)
          .catch(reject)
      })
        .then(res => {
          store.dispatch(
            updateFeatures(res.records.map(record => record.get('name')))
          )
          store.dispatch(
            updateUserCapability(USER_CAPABILITIES.proceduresReadable, true)
          )
          return Rx.Observable.of(null)
        })
        .catch(e => {
          store.dispatch(
            updateUserCapability(USER_CAPABILITIES.proceduresReadable, false)
          )
          return Rx.Observable.of(null)
        })
    })
    .mapTo({ type: FEATURE_DETECTION_DONE })
}

export const clearOnDisconnectEpic = some$ =>
  some$.ofType(DISCONNECTION_SUCCESS).mapTo({ type: CLEAR })
