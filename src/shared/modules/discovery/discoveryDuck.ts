/*
 * Copyright (c) "Neo4j"
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
  getAllowedBoltSchemes,
  CLOUD_SCHEMES
} from 'shared/modules/app/appDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import { generateBoltUrl } from 'services/boltscheme.utils'
import { getUrlInfo } from 'shared/services/utils'
import { isConnectedAuraHost } from 'shared/modules/connections/connectionsDuck'
import { isCloudHost } from 'shared/services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import {
  authRequestForSSO,
  handleAuthFromRedirect
} from 'shared/modules/auth/index'
import {
  authLog,
  removeSearchParamsInBrowserHistory
} from 'shared/modules/auth/helpers'
import {
  checkAndMergeSSOProviders,
  shouldRedirectToSSOServer,
  wasRedirectedBackFromSSOServer
} from 'shared/modules/auth/common'
import { searchParamsToRemoveAfterAutoRedirect } from 'shared/modules/auth/settings'

export const NAME = 'discover-bolt-host'
export const CONNECTION_ID = '$$discovery'

const initialState = {}
// Actions
const SET = `${NAME}/SET`
export const DONE = `${NAME}/DONE`
export const INJECTED_DISCOVERY = `${NAME}/INJECTED_DISCOVERY`

// Reducer
export default function reducer(state = initialState, action: any = {}) {
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
export const setBoltHost = (bolt: any) => {
  return {
    type: SET,
    boltHost: bolt
  }
}

export const updateDiscoveryConnection = (props: any) => {
  return updateConnection({
    ...props,
    id: CONNECTION_ID,
    name: CONNECTION_ID,
    type: 'bolt'
  })
}

export const getBoltHost = (state: any) => {
  return state.discovery.boltHost
}

const getAllowedBoltSchemesForHost = (
  state: any,
  host: string,
  encryptionFlag?: any
) =>
  isCloudHost(host, NEO4J_CLOUD_DOMAINS)
    ? CLOUD_SCHEMES
    : getAllowedBoltSchemes(state, encryptionFlag)

const updateDiscoveryState = (action: any, store: any) => {
  const keysToCopy = [
    'username',
    'password',
    'requestedUseDb',
    'restApi',
    'supportsMultiDb'
  ]
  const updateObj: any = keysToCopy.reduce(
    (accObj, key) => (action[key] ? { ...accObj, [key]: action[key] } : accObj),
    { host: action.forceURL }
  )

  if (typeof action.encrypted !== 'undefined') {
    updateObj.encrypted = action.encrypted
  }

  const updateAction = updateDiscoveryConnection(updateObj)
  store.dispatch(updateAction)
}

export const injectDiscoveryEpic = (action$: any, store: any) =>
  action$
    .ofType(INJECTED_DISCOVERY)
    .map((action: any) => {
      const connectUrl = generateBoltUrl(
        getAllowedBoltSchemesForHost(
          store.getState(),
          action.host,
          action.encrypted
        ),
        action.host
      )
      return updateDiscoveryState({ ...action, forceURL: connectUrl }, store)
    })
    .mapTo({ type: DONE })

export const discoveryOnStartupEpic = (some$: any, store: any) => {
  return some$
    .ofType(APP_START)
    .map((action: any) => {
      if (!action.url) return action
      const { searchParams } = new URL(action.url)

      const passedURL =
        searchParams.get('dbms') || searchParams.get('connectURL')

      const passedDb = searchParams.get('db')

      if (passedURL) {
        action.forceURL = decodeURIComponent(passedURL)
        action.requestedUseDb = passedDb
      }

      const discoveryURL = searchParams.get('discoveryURL')

      if (discoveryURL) {
        action.discoveryURL = discoveryURL
      }

      return action
    })
    .merge(some$.ofType(USER_CLEAR))
    .mergeMap((action: any) => {
      // Only when in a environment were we can guess discovery endpoint
      if (!action.discoveryURL || !hasDiscoveryEndpoint(store.getState())) {
        authLog('No    ')
        return Promise.resolve({ type: 'NOOP' })
      }
      if (action.forceURL) {
        const { username, protocol, host } = getUrlInfo(action.forceURL)

        const discovered = {
          username,
          requestedUseDb: action.requestedUseDb,
          host: `${protocol ? `${protocol}//` : ''}${host}`,
          supportsMultiDb: !!action.requestedUseDb,
          encrypted: action.encrypted,
          restApi: action.restApi,
          hasForceURL: true
        }
        const onlyTruthy = Object.entries(discovered)
          .filter(item => item[1] /* truthy check on value */)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

        return Promise.resolve({
          type: DONE,
          discovered: onlyTruthy
        })
      }
      const discoveryEndpoint = getDiscoveryEndpoint(
        getHostedUrl(store.getState())
      )
      return Rx.Observable.fromPromise(
        remote
          .getJSON(action.discoveryURL || discoveryEndpoint)
          // Uncomment below and comment out above when doing manual tests in dev mode to
          // fake discovery response
          //Promise.resolve({
          //bolt: 'bolt://localhost:7687',
          //neo4j_version: '4'
          //})
          .then(async result => {
            const ssoProviders =
              result.sso_providers || result.ssoproviders || result.ssoProviders
            let creds: { username?: string; password?: string } = {}
            let ssoError: string | undefined

            if (ssoProviders) {
              authLog('SSO providers found on endpoint')
              checkAndMergeSSOProviders(ssoProviders, true)
              const { searchParams } = new URL(window.location.href)

              if (shouldRedirectToSSOServer()) {
                const idpId = searchParams.get('arg')
                authLog(`Initialised with idpId: "${idpId}"`)

                removeSearchParamsInBrowserHistory(
                  searchParamsToRemoveAfterAutoRedirect
                )
                const err = authRequestForSSO(idpId)
                if (err) {
                  ssoError = err
                }
              } else if (wasRedirectedBackFromSSOServer()) {
                authLog('Handling auth_flow_step redirect')

                try {
                  creds = await handleAuthFromRedirect()
                } catch (e) {
                  ssoError = e
                  authLog(e)
                }
              }
            } else {
              authLog(
                `No SSO providers found in data at endpoint ${action.discoveryURL ||
                  discoveryEndpoint}`
              )
              // We assume if discoveryURL is set that they intended to use SSO
              if (action.discoveryURL) {
                ssoError = `No SSO providers found at ${action.discoveryURL}`
              }
            }

            let host =
              result &&
              (result.bolt_routing || result.bolt_direct || result.bolt)
            // Try to get info from server
            if (!host) {
              authLog('No host found in discovery data, aborting')
              throw new Error('No bolt address found')
            }
            host = generateBoltUrl(
              getAllowedBoltSchemesForHost(store.getState(), host),
              host
            )

            const isAura = isConnectedAuraHost(store.getState())
            const supportsMultiDb =
              !isAura && parseInt((result.neo4j_version || '0').charAt(0)) >= 4
            const discovered = supportsMultiDb
              ? { supportsMultiDb, host, ...creds, ssoError }
              : { host, ...creds, ssoError }

            return { type: DONE, discovered, ssoError }
          })
          .catch(() => {
            const noDataFoundMessage = `No discovery json data found at ${action.discoveryURL ||
              discoveryEndpoint}`
            const noHttpPrefixMessage = action?.discoveryURL.startsWith('http')
              ? 'Double check that the url is a valid url (including HTTP(S)).'
              : ''
            const noJsonSuffixMessage = action?.discoveryURL.endsWith('.json')
              ? 'Double check that the discovery url returns a valid JSON file.'
              : ''
            const ssoError = [
              noDataFoundMessage,
              noHttpPrefixMessage,
              noJsonSuffixMessage
            ].join('\n')
            authLog(ssoError)

            if (action.discoveryURL) {
              return { type: DONE, ssoError }
            }
            throw new Error('No info from endpoint')
          })
      ).catch(() => {
        return Promise.resolve({ type: DONE })
      })
    })
    .map((a: any) => a)
}
