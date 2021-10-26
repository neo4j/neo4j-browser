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

import {
  DiscoverableData,
  SSOProvider,
  updateConnection
} from 'shared/modules/connections/connectionsDuck'
import {
  APP_START,
  USER_CLEAR,
  hasDiscoveryEndpoint,
  getHostedUrl,
  getAllowedBoltSchemes,
  CLOUD_SCHEMES
} from 'shared/modules/app/appDuck'
import { getDiscoveryEndpoint, SSO } from 'services/bolt/boltHelpers'
import { generateBoltUrl } from 'services/boltscheme.utils'
import { getUrlInfo, hostIsAllowed } from 'shared/services/utils'
import { isConnectedAuraHost } from 'shared/modules/connections/connectionsDuck'
import { isCloudHost } from 'shared/services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import {
  authRequestForSSO,
  handleAuthFromRedirect,
  authLog,
  removeSearchParamsInBrowserHistory,
  getSSOServerIdIfShouldRedirect,
  wasRedirectedBackFromSSOServer,
  defaultSearchParamsToRemoveAfterAutoRedirect,
  fetchDiscoveryDataFromUrl,
  DiscoveryResult,
  Success,
  FetchError,
  NoProviderError
} from 'neo4j-client-sso'
import { connect } from 'react-redux'
import { merge } from 'lodash'

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

// export enum DiscoveryResultStatus {
//   Success = 0,
//   FetchError = 1,
//   NoProviderError = 2
// }

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
    .mergeMap(async (action: any) => {
      // For now we only want discoverydata we know is relevant to a specific bolt host
      // We can discover data from the following sources
      // encoded in action.forceURL
      // from hosted discovery
      // from fetching discoveryURL
      // from fetching the connectURL
      // from fetching a host entered previously

      // We can get a host from these sources. we pick one host to be most relevant
      // Order is:
      /* 
      entered previously
      from forceURL
      from discoveryURL
      from hosted

      we fetch all these, merge on what host we care about
      */

      let dataFromForceUrl: DiscoverableData = {}

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

        dataFromForceUrl = onlyTruthy
      }

      const discoveryEndpoint = getDiscoveryEndpoint(
        getHostedUrl(store.getState())
      )
      const discoveryEndpointData = await fetchBrowserDiscoveryDataFromUrl(
        discoveryEndpoint
      )
      const discoveryURLData = await (action.discoveryURL
        ? fetchBrowserDiscoveryDataFromUrl(action.discoveryURL)
        : Promise.resolve({
            status: NoProviderError,
            ssoProviders: [],
            host: undefined
          }))

      // startup
      // fetch all of them
      // merge via priority
      // discard incorrect hosts, and log
      // read from session storage for the redirect
      // decorate the host later

      // connect form
      // show what startup has
      // 1st step if they edit -> fetch that bolt host, (keep in local state for now) ignore everything else
      // 2nd step -> annotate with hosts, avoid refecthing and enable merging all four

      const isAura = isConnectedAuraHost(store.getState())
      mergedDiscoveryData.supportsMultiDb =
        !!action.requestedUseDb ||
        (!isAura &&
          parseInt((mergedDiscoveryData.neo4jVersion || '0').charAt(0)) >= 4)

      if (!mergedDiscoveryData.host) {
        authLog('No host found in discovery data, aborting.')
        return { type: DONE }
      }

      mergedDiscoveryData.host = generateBoltUrl(
        getAllowedBoltSchemesForHost(
          store.getState(),
          mergedDiscoveryData.host
        ),
        mergedDiscoveryData.host
      )

      let SSOError
      const SSORedirectId = getSSOServerIdIfShouldRedirect()
      if (SSORedirectId) {
        authLog(`Initialized with idpId: "${SSORedirectId}"`)

        removeSearchParamsInBrowserHistory(
          defaultSearchParamsToRemoveAfterAutoRedirect
        )
        const selectedSSOProvider = mergedDiscoveryData.SSOProviders.find(
          ({ id }) => id === SSORedirectId
        )
        if (selectedSSOProvider)
          try {
            await authRequestForSSO(selectedSSOProvider as SSOProvider)
          } catch (e) {
            if (e instanceof Error) {
              SSOError = e.message
              authLog(e.message)
            }
          }
        else {
          authLog(
            `No SSO provider with id: "${SSORedirectId}" found in disocvery data`
          )
        }
      } else if (wasRedirectedBackFromSSOServer()) {
        authLog('Initializing auth_flow_step redirect')

        try {
          const creds = (await handleAuthFromRedirect(
            mergedDiscoveryData.SSOProviders
          )) as {
            username: string
            password: string
          }

          return {
            type: DONE,
            discovered: {
              ...mergedDiscoveryData,
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

      return {
        type: DONE,
        discovered: {
          ...mergedDiscoveryData,
          SSOError,
          authenticationMethod: SSOError
            ? SSO
            : mergedDiscoveryData.authenticationMethod
        }
      }
    })
    .map((a: any) => a)
}

type ExtraDiscoveryFields = {
  host?: string
  neo4jVersion?: string
  neo4jEdition?: string
}

type BrowserDiscoveryResult = DiscoveryResult & ExtraDiscoveryFields

async function fetchBrowserDiscoveryDataFromUrl(
  url: string
): Promise<BrowserDiscoveryResult> {
  const res = await fetchDiscoveryDataFromUrl(url)
  const { otherDataDiscovered } = res

  const strOrUndefined = (val: unknown) =>
    typeof val === 'string' ? val : undefined

  const host = strOrUndefined(
    otherDataDiscovered.bolt_routing ||
      otherDataDiscovered.bolt_direct ||
      otherDataDiscovered.bolt
  )
  const neo4jVersion = strOrUndefined(otherDataDiscovered.neo4j_version)
  const neo4jEdition = strOrUndefined(otherDataDiscovered.neo4j_edition)

  return { ...res, host, neo4jEdition, neo4jVersion }
}

// async function fetchDataFromDiscoveryUrl(
//   url: string
// ): Promise<{
//   host?: string
//   neo4j_version?: string
//   SSOProviders: SSOProvider[]
// }> {
//   try {
//     authLog(`Fetching ${url} to discover SSO providers`)
//     const result = await remote.getJSON(url)
//     // Uncomment below and comment out above when doing manual tests in dev mode to
//     // fake discovery response
//     //Promise.resolve({
//     // bolt: 'bolt://localhost:7687',
//     // neo4j_version: '4.0.3'
//     //})
//     const host =
//       result && (result.bolt_routing || result.bolt_direct || result.bolt)

//     const ssoProviderField =
//       result.sso_providers || result.ssoproviders || result.ssoProviders

//     if (!ssoProviderField) {
//       authLog(`No sso provider field found on json at ${url}`)
//     }

//     const SSOProviders: SSOProvider[] = getValidSSOProviders(ssoProviderField)
//     if (SSOProviders.length === 0) {
//       authLog(`None of the sso providers found at ${url} were valid`)
//     } else {
//       authLog(
//         `Found SSO providers with ids:${SSOProviders.map(p => p.id).join(
//           ', '
//         )} on ${url}`
//       )
//     }

//     return { SSOProviders, host }
//   } catch (e) {
//     const noDataFoundMessage = `No discovery json data found at ${url}`
//     const noHttpPrefixMessage = url.toLowerCase().startsWith('http')
//       ? ''
//       : 'Double check that the url is a valid url (including HTTP(S)).'
//     const noJsonSuffixMessage = url.toLowerCase().endsWith('.json')
//       ? ''
//       : 'Double check that the discovery url returns a valid JSON file.'

//     const messages = [
//       `Request to ${url} failed with message: ${e}`,
//       noDataFoundMessage,
//       noHttpPrefixMessage,
//       noJsonSuffixMessage
//     ]

//     messages.forEach(m => authLog(m))

//     return { SSOProviders: [] }
//   }
// }
