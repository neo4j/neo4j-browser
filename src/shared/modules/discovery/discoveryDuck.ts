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

import { updateConnection } from 'shared/modules/connections/connectionsDuck'
import {
  APP_START,
  USER_CLEAR,
  hasDiscoveryEndpoint,
  getHostedUrl,
  getAllowedBoltSchemes,
  CLOUD_SCHEMES
} from 'shared/modules/app/appDuck'
import { generateBoltUrl } from 'services/boltscheme.utils'
import { isCloudHost, AUTH_STORAGE_CONNECT_HOST } from 'shared/services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import {
  authRequestForSSO,
  handleAuthFromRedirect,
  authLog,
  removeSearchParamsInBrowserHistory,
  getSSOServerIdIfShouldRedirect,
  wasRedirectedBackFromSSOServer,
  defaultSearchParamsToRemoveAfterAutoRedirect
} from 'neo4j-client-sso'
import { getAndMergeDiscoveryData } from './discoveryHelpers'

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

      const sessionStorageHost = sessionStorage.getItem(
        AUTH_STORAGE_CONNECT_HOST
      )
      if (sessionStorageHost) {
        sessionStorage.removeItem(AUTH_STORAGE_CONNECT_HOST)
        action.sessionStorageHost = sessionStorageHost
      }

      return action
    })
    .merge(some$.ofType(USER_CLEAR))
    .mergeMap(async (action: any) => {
      const { success, discoveryData } = await getAndMergeDiscoveryData({
        action,
        hostedURL: getHostedUrl(store.getState()),
        hasDiscoveryEndpoint: hasDiscoveryEndpoint(store.getState()),
        generateBoltUrlWithAllowedScheme: (boltUrl: string) =>
          generateBoltUrl(
            getAllowedBoltSchemesForHost(store.getState(), boltUrl),
            boltUrl
          )
      })

      if (!success) {
        return { type: DONE }
      }
      const SSOProviders = discoveryData.SSOProviders || []

      let SSOError
      const SSORedirectId = getSSOServerIdIfShouldRedirect()
      if (SSORedirectId) {
        authLog(`Initialized with idpId: "${SSORedirectId}"`)

        removeSearchParamsInBrowserHistory(
          defaultSearchParamsToRemoveAfterAutoRedirect
        )
        const selectedSSOProvider = SSOProviders.find(
          ({ id }) => id === SSORedirectId
        )
        if (selectedSSOProvider)
          try {
            await authRequestForSSO(selectedSSOProvider)
          } catch (e) {
            if (e instanceof Error) {
              SSOError = e.message
              authLog(e.message)
            }
          }
        else {
          authLog(
            `No SSO provider with id: "${SSORedirectId}" found in discovery data`
          )
        }
      } else if (wasRedirectedBackFromSSOServer()) {
        authLog('Initializing auth_flow_step redirect')

        try {
          const creds = await handleAuthFromRedirect(SSOProviders)

          return {
            type: DONE,
            discovered: {
              ...discoveryData,
              ...creds,
              attemptSSOLogin: true
            }
          }
        } catch (e) {
          if (e instanceof Error) {
            SSOError = e.message
            authLog(e.message)
          }
        }
      }

      return { type: DONE, discovered: { ...discoveryData, SSOError } }
    })
    .map((a: any) => a)
}
