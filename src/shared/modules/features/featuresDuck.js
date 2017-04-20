/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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
import { hydrate } from 'services/duckUtils'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'

export const NAME = 'features'
export const RESET = 'features/RESET'
export const UPDATE_ONE = 'features/UPDATE_ONE'
export const UPDATE_ALL = 'features/UPDATE_ALL'

export const getAvailableProcedures = (state) => state[NAME].availableProcedures

const initialState = {availableProcedures: []}

export default function (state = initialState, action) {
  state = hydrate(initialState, state)

  switch (action.type) {
    case UPDATE_ALL:
      state.availableProcedures = state.availableProcedures.concat(action.availableProcedures)
      return Object.assign({}, state)
    case RESET:
      return initialState
    default:
      return state
  }
}

// Actions
export const updateFeatures = (availableProcedures, context) => {
  return {
    type: UPDATE_ALL,
    availableProcedures
  }
}
export const featuresDicoveryEpic = (action$, store) => {
  return action$.ofType(CONNECTION_SUCCESS)
    .mergeMap(() => {
      return bolt.routedReadTransaction('CALL dbms.procedures YIELD name')
      .then((res) => {
        store.dispatch(updateFeatures(res.records.map((record) => record.get('name'))))
        return null
      })
      .catch((e) => {
        return null
      })
    })
    .mapTo({ type: 'NOOP' })
}
