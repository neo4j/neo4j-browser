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
import { updateConnection } from 'shared/modules/connections/connectionsDuck'
import {
  APP_START,
  USER_CLEAR,
  hasDiscoveryEndpoint,
  getAllowedBoltSchemes,
  CLOUD_SCHEMES
} from 'shared/modules/app/appDuck'
import { getUrlParamValue } from 'services/utils'
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
import { REDIRECT_URI, SSO_REDIRECT } from 'shared/modules/auth/constants'
import { checkAndMergeSSOProviders } from 'shared/modules/auth/common'
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
    .mergeMap((action: any) => {
      // Only when in a environment were we can guess discovery endpoint
      if (!hasDiscoveryEndpoint(store.getState())) {
        return Promise.resolve({ type: 'NOOP' })
      }
      const searchParams = new URL(window.location.href).searchParams
      const authFlowStep =
        (searchParams.get('auth_flow_step') || '').toLowerCase() ===
        REDIRECT_URI
      if (action.forceURL && !authFlowStep) {
        const { username, password, protocol, host } = getUrlInfo(
          action.forceURL
        )
        console.log(username, password)

        const discovered = {
          username,
          password,
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
      return Rx.Observable.fromPromise(
        //remote
        //  .getJSON(getDiscoveryEndpoint(getHostedUrl(store.getState())))

        // Uncomment below and comment out above when doing manual tests in dev mode to
        // fake discovery response
        Promise.resolve({
          bolt: 'bolt://localhost:7687',
          neo4j_version: '4',
          sso_providers: [
            {
              id: 'keycloak-oidc',
              name: 'KeyCloak',
              auth_flow: 'pkce',
              auth_endpoint:
                'http://localhost:18080/auth/realms/myrealm/protocol/openid-connect/auth',
              token_endpoint:
                'http://localhost:18080/auth/realms/myrealm/protocol/openid-connect/token',
              well_known_discovery_uri:
                'http://localhost:18080/auth/realms/myrealm/.well-known/openid-configuration',
              params: {
                client_id: 'account',
                redirect_uri:
                  'http://localhost:8080?idp_id=keycloak-oidc&auth_flow_step=redirect_uri',
                response_type: 'code',
                scope: 'openid groups'
              },
              config: {
                principal: 'preferred_username',
                code_challenge_method: 'S256'
              }
            }
          ]
        })
          .then(async result => {
            const ssoProviders = result.sso_providers //|| result.ssoproviders || result.ssoProviders

            if (ssoProviders) {
              authLog('SSO providers found on endpoint ')
              checkAndMergeSSOProviders(ssoProviders, true)
            } else {
              const errMsg = 'No SSO providers found on endpoint'
              authLog(errMsg)
            }

            const cmd = (searchParams.get('cmd') || '').toLowerCase()
            const arg = searchParams.get('arg')
            const authFlowStep = (
              searchParams.get('auth_flow_step') || ''
            ).toLowerCase()
            if (cmd === SSO_REDIRECT && arg) {
              authLog(`Initialised with cmd: "${cmd}" and arg: "${arg}"`)

              removeSearchParamsInBrowserHistory(
                searchParamsToRemoveAfterAutoRedirect
              )

              authRequestForSSO(arg)
            } else if (authFlowStep === REDIRECT_URI) {
              authLog('Handling auth_flow_step redirect')

              const host = result && result.bolt
              const creds = await handleAuthFromRedirect(() => undefined)
              return { type: DONE, discovered: { host, ...creds.credentials } }
            }

            let host = result && result.bolt
            // Try to get info from server
            if (!host) {
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
              ? { supportsMultiDb, host }
              : { host }

            return { type: DONE, discovered }
          })
          .catch(() => {
            throw new Error('No info from endpoint')
          })
      ).catch(() => {
        return Promise.resolve({ type: DONE })
      })
    })
    .map((a: any) => a)
}
