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
  authLog,
  fetchDiscoveryDataFromUrl,
  DiscoveryResult,
  FetchError,
  NoProviderError
} from 'neo4j-client-sso'
import {
  DiscoverableData,
  Connection
} from 'shared/modules/connections/connectionsDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import { boltToHttp, boltUrlsHaveSameHost } from 'services/boltscheme.utils'
import { getUrlInfo, isCloudHost } from 'shared/services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import { pick } from 'lodash'

type ExtraDiscoveryFields = {
  host?: string
  neo4jVersion?: string
  neo4jEdition?: string
}

type BrowserDiscoveryResult = DiscoveryResult & ExtraDiscoveryFields

export async function fetchBrowserDiscoveryDataFromUrl(
  url: string
): Promise<BrowserDiscoveryResult> {
  const res = await fetchDiscoveryDataFromUrl(url)
  const { otherDataDiscovered } = res

  if (res.status === FetchError) {
    return res
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

  return {
    ...res,
    host,
    ...(host ? { host } : {}),
    ...(neo4jEdition ? { neo4jEdition } : {}),
    ...(neo4jVersion ? { neo4jVersion } : {})
  }
}

type DataFromPreviousAction = {
  forceUrl: string
  discoveryUrl: string
  sessionStorageHost: string | null
  requestedUseDb?: string
  encrypted?: boolean
  restApi?: string
  discoveryConnection?: Connection
}

type GetAndMergeDiscoveryDataParams = {
  action: DataFromPreviousAction
  hostedUrl: string
  hasDiscoveryEndpoint: boolean
  generateBoltUrlWithAllowedScheme: (boltUrl: string) => string
}
type TaggedDiscoveryData = DiscoverableData & {
  source: DiscoveryDataSource
  urlMissing: boolean
  host: string
  onlyCheckForHost?: boolean
}

type DiscoveryDataSource =
  | 'connectForm'
  | 'discoveryUrl'
  | 'connectUrl'
  | 'discoveryConnection'
  | 'discoveryEndpoint'
export const CONNECT_FORM = 'connectForm'
export const DISCOVERY_URL = 'discoveryURL'
export const CONNECT_URL = 'connectURL'
export const DISCOVERY_CONNECTION = 'discoveryConnection'
export const DISCOVERY_ENDPOINT = 'discoveryEndpoint'

const onlyTruthyValues = (obj: any) =>
  Object.entries(obj)
    .filter(item => item[1] /* truthy check on value */)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

export async function getAndMergeDiscoveryData({
  action,
  hostedUrl,
  hasDiscoveryEndpoint,
  generateBoltUrlWithAllowedScheme
}: GetAndMergeDiscoveryDataParams): Promise<DiscoverableData | null> {
  const { sessionStorageHost, forceUrl, discoveryConnection } = action

  let dataFromForceUrl: DiscoverableData = {}
  let dataFromConnection: DiscoverableData = {}

  if (forceUrl) {
    const { username, protocol, host } = getUrlInfo(forceUrl)

    const discovered = {
      username,
      requestedUseDb: action.requestedUseDb,
      host: `${protocol ? `${protocol}//` : ''}${host}`,
      supportsMultiDb: !!action.requestedUseDb,
      encrypted: action.encrypted,
      restApi: action.restApi,
      hasForceUrl: true
    }

    dataFromForceUrl = onlyTruthyValues(discovered)
  } else if (discoveryConnection) {
    const discovered = {
      username: discoveryConnection.username,
      requestedUseDb: discoveryConnection.db,
      host: discoveryConnection.host,
      supportsMultiDb: !!discoveryConnection.db
    }

    dataFromConnection = onlyTruthyValues(discovered)
  }

  const sessionStorageHostPromise = sessionStorageHost
    ? fetchBrowserDiscoveryDataFromUrl(
        boltToHttp(generateBoltUrlWithAllowedScheme(sessionStorageHost))
      )
    : Promise.resolve(null)

  const forceUrlHostPromise = dataFromForceUrl.host
    ? fetchBrowserDiscoveryDataFromUrl(
        boltToHttp(generateBoltUrlWithAllowedScheme(dataFromForceUrl.host))
      )
    : Promise.resolve(null)

  const discoveryConnectionHostPromise = dataFromConnection.host
    ? fetchBrowserDiscoveryDataFromUrl(
        boltToHttp(generateBoltUrlWithAllowedScheme(dataFromConnection.host))
      )
    : Promise.resolve(null)

  const discoveryUrlParamPromise = action.discoveryUrl
    ? fetchBrowserDiscoveryDataFromUrl(action.discoveryUrl)
    : Promise.resolve(null)

  const discoveryEndpointPromise = hasDiscoveryEndpoint
    ? fetchBrowserDiscoveryDataFromUrl(getDiscoveryEndpoint(hostedUrl))
    : Promise.resolve(null)

  // Promise all is safe since fetchDataFromDiscoveryUrl never rejects
  const [
    sessionStorageHostData,
    forceUrlHostData,
    discoveryUrlParamData,
    discoveryConnectionHostData,
    discoveryEndpointData
  ] = await Promise.all([
    sessionStorageHostPromise,
    forceUrlHostPromise,
    discoveryUrlParamPromise,
    discoveryConnectionHostPromise,
    discoveryEndpointPromise
  ])

  // Ordered by importance, top-most data takes precedence
  const normalisedDiscoveryData: TaggedDiscoveryData[] = [
    {
      source: CONNECT_FORM,
      urlMissing: sessionStorageHostData === null,
      ...sessionStorageHostData,
      host: sessionStorageHostData?.host || sessionStorageHost
    },
    {
      source: CONNECT_URL,
      // The "dataFromForceURL" we want to keep regardless if there was a network request or not.
      // if we're dealing with a pre 4.4 server the disc request will fail even as there's a db present
      onlyCheckForHost: true,
      urlMissing: forceUrlHostData === null,
      ...dataFromForceUrl,
      ...forceUrlHostData,
      host: forceUrlHostData?.host || dataFromForceUrl.host
    },
    {
      source: DISCOVERY_URL,
      urlMissing: discoveryUrlParamData === null,
      ...discoveryUrlParamData
    },
    {
      source: DISCOVERY_CONNECTION,
      urlMissing: discoveryConnectionHostData === null,
      ...discoveryConnectionHostData,
      host: discoveryConnectionHostData?.host || discoveryConnection?.host
    },
    {
      source: DISCOVERY_ENDPOINT,
      urlMissing: discoveryEndpointData === null,
      ...discoveryEndpointData
    }
  ].filter((entry): entry is TaggedDiscoveryData => {
    if ('onlyCheckForHost' in entry && !entry.onlyCheckForHost) {
      if (entry.urlMissing || !('status' in entry)) {
        authLog(`Found no url from source: ${entry.source} to fetch.`)
        return false
      }

      if (entry.status === FetchError) {
        authLog(`Failed to fetch source: ${entry.source}.`)
        return false
      }
    }

    if (!('host' in entry) || !entry.host) {
      authLog(
        `Couldn't find bolt host to associate with discovery data from source ${entry.source}, dropping.`
      )
      return false
    }
    return true
  })

  if (normalisedDiscoveryData.length === 0) {
    authLog('No valid discovery data found, aborting SSO flow')
    return null
  }

  const [mainDiscoveryData, ...otherDiscoveryData] = normalisedDiscoveryData
  authLog(
    `Using host: ${mainDiscoveryData.host} from ${mainDiscoveryData.source} for SSO flow.`
  )

  const keysToCopy: (keyof DiscoverableData)[] = [
    'username',
    'password',
    'requestedUseDb',
    'restApi',
    'supportsMultiDb',
    'host',
    'encrypted',
    'SSOError',
    'SSOProviders',
    'neo4jVersion',
    'hasForceUrl'
  ]

  let mergedDiscoveryData = pick(mainDiscoveryData, keysToCopy)
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
      const newSSOProviders = (data.SSOProviders || []).filter(
        newProvider => !currentSSOProviderIds.has(newProvider.id)
      )
      mergedDiscoveryData = {
        ...pick(data, keysToCopy),
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

  return mergedDiscoveryData
}
