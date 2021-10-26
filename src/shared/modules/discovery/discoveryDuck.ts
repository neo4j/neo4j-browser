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
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import {
  boltToHttp,
  boltUrlsHaveSameHost,
  generateBoltUrl
} from 'services/boltscheme.utils'
import { getUrlInfo } from 'shared/services/utils'
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
  FetchError
} from 'neo4j-client-sso'

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

      const sessionStorageHost = 'abc' // TODO pickup and remove session storage host
      if (sessionStorageHost) {
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

type ExtraDiscoveryFields = {
  host?: string
  neo4jVersion?: string
  neo4jEdition?: string
}

type BrowserDiscoveryResult = DiscoveryResult & ExtraDiscoveryFields

async function fetchBrowserDiscoveryDataFromUrl(
  url: string
): Promise<BrowserDiscoveryResult | null> {
  const res = await fetchDiscoveryDataFromUrl(url)
  const { otherDataDiscovered } = res

  if (res.status === FetchError) {
    return null
  }

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

// TODO check if we need to check host is allowed? `hostIsAllowed`
// TODO do we need to log more about why disc data was missing

type DataFromPreviousAction = {
  forceURL: string
  discoveryURL: string
  requestedUseDb: string
  encrypted: boolean
  restApi: string
  sessionStorageHost: string | null
}

type GetAndMergeDiscoveryDataParams = {
  action: DataFromPreviousAction
  hostedURL: string
  hasDiscoveryEndpoint: boolean
  generateBoltUrlWithAllowedScheme: (boltUrl: string) => string
}

export async function getAndMergeDiscoveryData({
  action,
  hostedURL,
  hasDiscoveryEndpoint,
  generateBoltUrlWithAllowedScheme
}: GetAndMergeDiscoveryDataParams): Promise<{
  success: boolean
  discoveryData: DiscoverableData
}> {
  const { sessionStorageHost, forceURL } = action

  let dataFromForceURL: DiscoverableData = {}
  if (forceURL) {
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

    dataFromForceURL = onlyTruthy
  }

  const sessionStorageHostPromise = sessionStorageHost
    ? fetchBrowserDiscoveryDataFromUrl(
        boltToHttp(generateBoltUrlWithAllowedScheme(sessionStorageHost))
      )
    : Promise.resolve(null)

  const forceUrlHostPromise = dataFromForceURL.host
    ? fetchBrowserDiscoveryDataFromUrl(
        boltToHttp(generateBoltUrlWithAllowedScheme(dataFromForceURL.host))
      )
    : Promise.resolve(null)

  const discoveryUrlParamPromise = action.discoveryURL
    ? fetchBrowserDiscoveryDataFromUrl(action.discoveryURL)
    : Promise.resolve(null)

  const discoveryEndpointPromise = hasDiscoveryEndpoint
    ? fetchBrowserDiscoveryDataFromUrl(getDiscoveryEndpoint(hostedURL))
    : Promise.resolve(null)

  // Promise all is safe since fetchDataFromDiscoveryUrl never rejects
  const [
    sessionStorageHostData,
    forceUrlHostData,
    discoveryUrlParamData,
    discoveryEndpointData
  ] = await Promise.all([
    sessionStorageHostPromise,
    forceUrlHostPromise,
    discoveryUrlParamPromise,
    discoveryEndpointPromise
  ])

  type TaggedDiscoveryData = DiscoverableData & {
    host: string
    source: string
    hasData: boolean
  }

  const normalisedDiscoveryData = [
    {
      host: sessionStorageHost,
      source: 'connectForm',
      hasData: sessionStorageHostData === null,
      ...sessionStorageHostData
    },
    {
      host: action.forceURL,
      source: 'connectURL',
      hasData: forceUrlHostData === null,
      ...forceUrlHostData
    },
    {
      source: 'discoveryURL',
      hasData: discoveryUrlParamData === null,
      ...discoveryUrlParamData
    },
    {
      source: 'discoveryEndpoint',
      hasData: discoveryEndpointData === null,
      ...discoveryEndpointData
    }
  ].filter((entry): entry is TaggedDiscoveryData => {
    if (!entry.hasData) {
      authLog(`No discovery data from source ${entry.source}.`) // say url as well?
      return false
    }

    if ('host' in entry && entry.host) {
      authLog(
        `Couldn't find bolt host to associate with discovery data from source ${entry.source}, dropping.`
      )
      return false
    }
    return true
  })

  if (normalisedDiscoveryData.length === 0) {
    authLog('No valid discovery data found, aborting SSO flow')
    return { success: false, discoveryData: {} }
  }

  const [mainDiscoveryData, ...otherDiscoveryData] = normalisedDiscoveryData
  authLog(
    `Using host: ${mainDiscoveryData.host} from ${mainDiscoveryData.source} for SSO flow.`
  )

  let mergedDiscoveryData = mainDiscoveryData
  if (otherDiscoveryData.length > 1) {
    const otherDiscoveryDataWithMatchingHost = otherDiscoveryData.filter(
      ({ host, source }) => {
        if (boltUrlsHaveSameHost(mainDiscoveryData.host, host)) {
          return true
        } else {
          authLog(
            `Dropping discovery data from ${source} as it's bolt host: ${host} doesn't match ${mainDiscoveryData.host}.`
          )
          return false
        }
      }
    )

    otherDiscoveryDataWithMatchingHost.forEach(data => {
      authLog(`Merging discovery data from ${data.source} as hosts match`)
      const currentSSOProviders = mergedDiscoveryData.SSOProviders || []
      const currentSSOProviderIds = new Set(currentSSOProviders.map(p => p.id))
      const newSSOProviders = (data.SSOProviders || []).filter(newProvider =>
        currentSSOProviderIds.has(newProvider.id)
      )
      mergedDiscoveryData = {
        ...data,
        ...mergedDiscoveryData,
        SSOProviders: currentSSOProviders.concat(newSSOProviders)
      }
    })
  }

  const isAura = isCloudHost(mergedDiscoveryData.host, NEO4J_CLOUD_DOMAINS)
  mergedDiscoveryData.supportsMultiDb =
    !!action.requestedUseDb ||
    (!isAura &&
      parseInt((mergedDiscoveryData.neo4jVersion || '0').charAt(0)) >= 4)

  mergedDiscoveryData.host = generateBoltUrlWithAllowedScheme(
    mergedDiscoveryData.host
  )

  return { success: true, discoveryData: mergedDiscoveryData }
}
