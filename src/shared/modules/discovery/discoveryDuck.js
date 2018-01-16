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

import Rx from 'rxjs/Rx'
import remote from 'services/remote'
import { updateConnection } from 'shared/modules/connections/connectionsDuck'
import { APP_START, USER_CLEAR, inWebEnv } from 'shared/modules/app/appDuck'
import { updateBoltRouting } from 'shared/modules/settings/settingsDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import { getUrlParamValue, toBoltHost, isRoutingHost } from 'services/utils'
import { getUrlInfo } from 'shared/services/utils'

export const NAME = 'discover-bolt-host'
export const CONNECTION_ID = '$$discovery'

const initialState = {}
// Actions
const SET = `${NAME}/SET`
export const DONE = `${NAME}/DONE`
export const INJECTED_DISCOVERY = `${NAME}/INJECTED_DISCOVERY`

// Reducer
export default function reducer (state = initialState, action = {}) {
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
  // Remove any protocol and prepend with bolt://
  const host = toBoltHost(action.forceURL)
  const updateObj = { host }

  // Set config to use routing if bolt+routing:// protocol
  if (isRoutingHost(action.forceURL)) {
    store.dispatch(updateBoltRouting(true))
  }
  if (action.username && action.password) {
    updateObj.username = action.username
    updateObj.password = action.password
  }
  if (typeof action.encrypted !== 'undefined') {
    updateObj.encrypted = action.encrypted
  }
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
      if (!inWebEnv(store.getState())) return Promise.resolve({ type: 'NOOP' }) // Only when in a web environment
      if (action.forceURL) {
        const { username, password } = getUrlInfo(action.forceURL)
        updateDiscoveryState({ ...action, username, password }, store)
        return Promise.resolve({ type: DONE })
      }
      return Rx.Observable
        .fromPromise(
          remote
            .getJSON(getDiscoveryEndpoint())
            .then(result => {
              // Try to get info from server
              if (!result || !result.bolt) {
                throw new Error('No bolt address found') // No bolt info from server, throw
              }
              store.dispatch(updateDiscoveryConnection({ host: result.bolt })) // Update discovery host in redux
              return { type: DONE }
            })
            .catch(e => {
              throw new Error('No info from endpoint') // No info from server, throw
            })
        )
        .catch(e => {
          return Promise.resolve({ type: DONE })
        })
    })
    .map(a => a)
}
