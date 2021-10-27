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
  FetchError
} from 'neo4j-client-sso'
import { DiscoverableData } from 'shared/modules/connections/connectionsDuck'
import { getDiscoveryEndpoint } from 'services/bolt/boltHelpers'
import { boltToHttp, boltUrlsHaveSameHost } from 'services/boltscheme.utils'
import { getUrlInfo, isCloudHost } from 'shared/services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'

type ExtraDiscoveryFields = {
  host?: string
  neo4jVersion?: string
  neo4jEdition?: string
}

type BrowserDiscoveryResult = DiscoveryResult & ExtraDiscoveryFields

export async function fetchBrowserDiscoveryDataFromUrl(
  url: string
): Promise<BrowserDiscoveryResult | null> {
  const res = await fetchDiscoveryDataFromUrl(url)
  const { otherDataDiscovered } = res

  if (res.status === FetchError) {
    return null //TODO better errorhandling
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
  sessionStorageHost: string | null
  requestedUseDb?: string
  encrypted?: boolean
  restApi?: string
}

type GetAndMergeDiscoveryDataParams = {
  action: DataFromPreviousAction
  hostedURL: string
  hasDiscoveryEndpoint: boolean
  generateBoltUrlWithAllowedScheme: (boltUrl: string) => string
}
type TaggedDiscoveryData = DiscoverableData & {
  host: string
  source: string
  hasData: boolean
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

  const normalisedDiscoveryData = [
    {
      host: sessionStorageHost,
      source: 'connectForm',
      hasData: sessionStorageHostData !== null,
      ...sessionStorageHostData
    },
    {
      host: action.forceURL,
      source: 'connectURL',
      hasData: forceUrlHostData !== null,
      ...forceUrlHostData
    },
    {
      source: 'discoveryURL',
      hasData: discoveryUrlParamData !== null,
      ...discoveryUrlParamData
    },
    {
      source: 'discoveryEndpoint',
      hasData: discoveryEndpointData !== null,
      ...discoveryEndpointData
    }
  ].filter((entry): entry is TaggedDiscoveryData => {
    if (!entry.hasData) {
      authLog(`No discovery data from source ${entry.source}.`) // say url as well?
      return false
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
      const currentSSOProviders = mergedDiscoveryData.ssoProviders || []
      const currentSSOProviderIds = new Set(currentSSOProviders.map(p => p.id))
      const newSSOProviders = (data.ssoProviders || []).filter(
        newProvider => !currentSSOProviderIds.has(newProvider.id)
      )
      mergedDiscoveryData = {
        ...data,
        ...mergedDiscoveryData,
        ssoProviders: currentSSOProviders.concat(newSSOProviders)
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
