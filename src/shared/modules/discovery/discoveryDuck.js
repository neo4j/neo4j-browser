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

import { updateConnection } from 'shared/modules/connections/connectionsDuck'
import {
  APP_START,
  USER_CLEAR,
  hasDiscoveryEndpoint
} from 'shared/modules/app/appDuck'
import { getUrlParamValue } from 'services/utils'
import neo4jCredential from '../../credential/neo4jCredential'

export const NAME = 'discover-bolt-host'
export const CONNECTION_ID = '$$discovery'

const initialState = {}
// Actions
const SET = `${NAME}/SET`
export const DONE = `${NAME}/DONE`
export const INJECTED_DISCOVERY = `${NAME}/INJECTED_DISCOVERY`

// Reducer
export default function reducer(state = initialState, action = {}) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case SET:
      return Object.assign({}, state, { boltHost: action.boltHost })
    default:
      return state
  }
}

// Action Creators
export const setBoltHost = bolt => {
  return {
    type: SET,
    boltHost: bolt
  }
}

export const updateDiscoveryConnection = props => {
  return updateConnection({
    ...props,
    id: CONNECTION_ID,
    name: CONNECTION_ID,
    type: 'bolt'
  })
}

export const getBoltHost = state => {
  return state.discovery.boltHost
}

const updateDiscoveryState = (action, store) => {
  const updateObj = { host: action.forceURL }
  if (action.username && action.password) {
    updateObj.username = action.username
    updateObj.password = action.password
  }
  if (typeof action.encrypted !== 'undefined') {
    updateObj.encrypted = action.encrypted
  }
  updateObj.restApi = action.restApi

  const updateAction = updateDiscoveryConnection(updateObj)
  store.dispatch(updateAction)
}

export const injectDiscoveryEpic = (action$, store) =>
  action$
    .ofType(INJECTED_DISCOVERY)
    .map(action =>
      updateDiscoveryState({ ...action, forceURL: action.host }, store)
    )
    .mapTo({ type: DONE })

export const discoveryOnStartupEpic = (some$, store) => {
  return some$
    .ofType(APP_START)
    .map(action => {
      if (!action.url) return action
      const passedURL = getUrlParamValue('connectURL', action.url)
      if (!passedURL || !passedURL.length) return action
      action.forceURL = decodeURIComponent(passedURL[0])
      return action
    })
    .merge(some$.ofType(USER_CLEAR))
    .mergeMap(action => {
      // Only when in a environment were we can guess discovery endpoint
      if (!hasDiscoveryEndpoint(store.getState())) {
        return Promise.resolve({ type: 'NOOP' })
      }

      updateDiscoveryState(
        {
          ...action,
          username: neo4jCredential.userName,
          password: neo4jCredential.password,
          forceURL: neo4jCredential.host
        },
        store
      )
      return Promise.resolve({ type: DONE })
    })
    .map(a => a)
}
