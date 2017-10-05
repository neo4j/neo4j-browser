/*
 * Copyright (c) 2002-2017 "Neo4j, Inc,"
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
import { APP_START, USER_CLEAR } from 'shared/modules/app/appDuck'
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

export const discoveryOnStartupEpic = (some$, store) => {
  return some$
    .ofType(APP_START)
    .merge(some$.ofType(USER_CLEAR))
    .map(action => {
      if (action.type !== APP_START) return action // Only read on app startup
      if (!action.url) return action
      const passedURL = getUrlParamValue('connectURL', action.url)
      if (!passedURL || !passedURL.length) return action
      const forceURL = decodeURIComponent(passedURL[0])
      action.forceURL = toBoltHost(forceURL) // Remove any protocol and prepend with bolt://
      const { username, password } = getUrlInfo(forceURL)
      action.username = username
      action.password = password
      if (isRoutingHost(forceURL)) {
        // Set config to use routing if bolt+routing:// protocol
        store.dispatch(updateBoltRouting(true))
      }
      return action
    })
    .mergeMap(action => {
      if (action.forceURL) {
        let updateAction
        if (action.username && action.password) {
          updateAction = updateDiscoveryConnection({
            username: action.username,
            password: action.password,
            host: action.forceURL
          })
        } else {
          updateAction = updateDiscoveryConnection({ host: action.forceURL })
        }
        store.dispatch(updateAction)
        return Promise.resolve()
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
              return result
            })
            .catch(e => {
              throw new Error('No bolt address found') // No info from server, throw
            })
        )
        .catch(e => {
          return new Promise((resolve, reject) => resolve(e))
        })
    })
    .mapTo({ type: DONE })
}
