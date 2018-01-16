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

import bolt from 'services/bolt/bolt'
import { APP_START, WEB } from 'shared/modules/app/appDuck'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'

export const NAME = 'features'
export const RESET = 'features/RESET'
export const UPDATE_ALL_FEATURES = 'features/UPDATE_ALL_FEATURES'

export const getAvailableProcedures = state => state[NAME].availableProcedures
export const isACausalCluster = state =>
  getAvailableProcedures(state).includes('dbms.cluster.overview')
export const canAssignRolesToUser = state =>
  getAvailableProcedures(state).includes('dbms.security.addRoleToUser')
export const useBrowserSync = state => !!state[NAME].browserSync

const initialState = {
  availableProcedures: [],
  browserSync: true
}

export default function (state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state, browserSync: action.env === WEB }
  }

  switch (action.type) {
    case UPDATE_ALL_FEATURES:
      return { ...state, availableProcedures: [...action.availableProcedures] }
    case RESET:
      return initialState
    default:
      return state
  }
}

// Action creators
export const updateFeatures = availableProcedures => {
  return {
    type: UPDATE_ALL_FEATURES,
    availableProcedures
  }
}

export const featuresDiscoveryEpic = (action$, store) => {
  return action$
    .ofType(CONNECTION_SUCCESS)
    .mergeMap(() => {
      return bolt
        .routedReadTransaction('CALL dbms.procedures YIELD name')
        .then(res => {
          store.dispatch(
            updateFeatures(res.records.map(record => record.get('name')))
          )
          return null
        })
        .catch(e => {
          return null
        })
    })
    .mapTo({ type: 'NOOP' })
}
