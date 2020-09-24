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
import remote from 'services/remote'
import { updateConnection } from 'shared/modules/connections/connectionsDuck'
import {
  APP_START,
  USER_CLEAR,
  hasDiscoveryEndpoint,
  getHostedUrl,
  getAllowedBoltSchemes
} from 'shared/modules/app/appDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import { getUrlParamValue } from 'services/utils'
import { generateBoltUrl } from 'services/boltscheme.utils'
import { getUrlInfo } from 'shared/services/utils'
import { CLOUD, getEnv } from 'shared/modules/app/appDuck'

export const NAME = 'discover-bolt-host'
export const CONNECTION_ID = '$$discovery'

const initialState = {}
// Actions
const SET = `${NAME}/SET`
export const DONE = `${NAME}/DONE`
export const INJECTED_DISCOVERY = `${NAME}/INJECTED_DISCOVERY`

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case SET:
      return {
        ...state,
        boltHost: action.boltHost
      }
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
  const keysToCopy = [
    'username',
    'password',
    'requestedUseDb',
    'restApi',
    'supportsMultiDb'
  ]
  const updateObj = keysToCopy.reduce(
    (accObj, key) => (action[key] ? { ...accObj, [key]: action[key] } : accObj),
    { host: action.forceURL }
  )

  if (typeof action.encrypted !== 'undefined') {
    updateObj.encrypted = action.encrypted
  }

  const updateAction = updateDiscoveryConnection(updateObj)
  store.dispatch(updateAction)
}

export const injectDiscoveryEpic = (action$, store) =>
  action$
    .ofType(INJECTED_DISCOVERY)
    .map(action => {
      const connectUrl = generateBoltUrl(
        getAllowedBoltSchemes(store.getState(), action.encrypted),
        action.host
      )
      return updateDiscoveryState({ ...action, forceURL: connectUrl }, store)
    })
    .mapTo({ type: DONE })

export const discoveryOnStartupEpic = (some$, store) => {
  return some$
    .ofType(APP_START)
    .map(action => {
      if (!action.url) return action
      const passedURL =
        getUrlParamValue('dbms', action.url) ||
        getUrlParamValue('connectURL', action.url)

      const passedDb = getUrlParamValue('db', action.url)

      if (!passedURL || !passedURL.length) return action
      action.forceURL = decodeURIComponent(passedURL[0])
      action.requestedUseDb = passedDb && passedDb[0]
      return action
    })
    .merge(some$.ofType(USER_CLEAR))
    .mergeMap(action => {
      // Only when in a environment were we can guess discovery endpoint
      if (!hasDiscoveryEndpoint(store.getState())) {
        return Promise.resolve({ type: 'NOOP' })
      }
      if (action.forceURL) {
        const { username, protocol, host } = getUrlInfo(action.forceURL)
        updateDiscoveryState(
          {
            ...action,
            username,
            supportsMultiDb: !!action.requestedUseDb,
            forceURL: `${protocol ? `${protocol}//` : ''}${host}`
          },
          store
        )
        return Promise.resolve({ type: DONE })
      }
      return Rx.Observable.fromPromise(
        remote
          .getJSON(getDiscoveryEndpoint(getHostedUrl(store.getState())))
          // Uncomment below and comment out above when doing manual tests in dev mode to
          // fake discovery response
          //Promise.resolve({
          // bolt: 'bolt://localhost:7687',
          //neo4j_version: '4.0.3'
          //})
          .then(result => {
            let host =
              result &&
              (result.bolt_routing || result.bolt_direct || result.bolt)
            // Try to get info from server
            if (!host) {
              throw new Error('No bolt address found')
            }
            host = generateBoltUrl(
              getAllowedBoltSchemes(store.getState()),
              host
            )

            const isAura = getEnv(store.getState()) === CLOUD
            const supportsMultiDb =
              !isAura && parseInt((result.neo4j_version || '0').charAt(0)) >= 4
            store.dispatch(updateDiscoveryConnection({ host, supportsMultiDb })) // Update discovery host in redux
            return { type: DONE }
          })
          .catch(e => {
            throw new Error('No info from endpoint')
          })
      ).catch(e => {
        return Promise.resolve({ type: DONE })
      })
    })
    .map(a => a)
}
