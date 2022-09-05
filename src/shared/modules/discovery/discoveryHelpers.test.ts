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
import 'isomorphic-fetch'
import nock from 'nock'

import { getAndMergeDiscoveryData } from './discoveryHelpers'
import { fakeDiscoveryResponse } from './discoveryMocks'

const baseAction = {
  encrypted: false,
  requestedUseDb: '',
  restApi: '',
  sessionStorageHost: '',
  forceUrl: '',
  discoveryUrl: ''
}
const sessionStorageHost = 'http://sessionStorageHost.com'
const hostedUrl = 'http://hostedURL.com'
const forceUrl = 'http://forceURL.com'
const discoveryUrl = 'http://discoveryURL.com'
const generateBoltUrlWithAllowedScheme = (s: string) => s

let logs = []
const logger = console.log
describe('getAndMergeDiscoveryData', () => {
  beforeAll(() => {
    console.log = (text: string) => logs.push(text)
  })

  beforeEach(() => {
    logs = []
  })
  beforeAll(() => {
    nock.disableNetConnect()
    if (!nock.isActive()) {
      nock.activate()
    }
  })

  afterEach(() => {
    nock.cleanAll()
  })

  afterAll(() => {
    console.log = logger
    nock.restore()
  })

  test('finds host when only discovery endpoint (with SSO) is set up', async () => {
    const boltHost = 'neo4j://localhost:7687'
    const browserHost = 'http://localhost:7474'
    const neo4jVersion = '4.4.1'

    nock(browserHost)
      .get('/')
      .reply(200, fakeDiscoveryResponse({ host: boltHost, neo4jVersion }))

    // When
    const discoveryData = await getAndMergeDiscoveryData({
      action: baseAction,
      hostedUrl: browserHost,
      generateBoltUrlWithAllowedScheme,
      hasDiscoveryEndpoint: true
    })
    expect(discoveryData).toBeTruthy()
    expect(discoveryData?.host).toEqual(boltHost)
    //expect(discoveryData?.source).toEqual(DISCOVERY_ENDPOINT)
    expect(discoveryData?.SSOProviders).toEqual([])
    expect(discoveryData?.SSOError).toEqual(undefined)
    expect(discoveryData?.neo4jVersion).toEqual(neo4jVersion)
  })

  test('finds host when only discovery endpoint (pre 4.4, without SSO) is set up', async () => {
    const boltHost = 'neo4j://localhost:7687'
    const browserHost = 'http://localhost:7474'
    const neo4jVersion = '4.3.1'

    nock(browserHost).get('/').reply(200, {
      bolt_routing: boltHost,
      bolt_direct: boltHost,
      neo4j_version: neo4jVersion,
      neo4j_edition: 'enterprise'
    })

    // When
    const discoveryData = await getAndMergeDiscoveryData({
      action: baseAction,
      hostedUrl: browserHost,
      generateBoltUrlWithAllowedScheme,
      hasDiscoveryEndpoint: true
    })
    expect(discoveryData).toBeTruthy()
    expect(discoveryData?.host).toEqual(boltHost)

    expect(discoveryData?.SSOProviders).toEqual([])
    expect(discoveryData?.SSOError).toEqual(undefined)
    expect(discoveryData?.neo4jVersion).toEqual(neo4jVersion)
  })

  test('finds and priotises sso providers from session storage/connect form when all discovery sources are present, but doesnt merge when hosts differ', async () => {
    // Given
    ;[hostedUrl, forceUrl, discoveryUrl].forEach(host =>
      nock(host)
        .get('/')
        .reply(
          200,
          fakeDiscoveryResponse({ providerIds: ['azure'], host: 'otherhost' })
        )
    )

    nock(sessionStorageHost)
      .get('/')
      .reply(
        200,
        fakeDiscoveryResponse({
          providerIds: ['google', 'lundskommun'],
          host: 'bolthost'
        })
      )

    const action = {
      ...baseAction,
      discoveryUrl: discoveryUrl,
      forceUrl: forceUrl,
      sessionStorageHost
    }

    // When
    const discoveryData = await getAndMergeDiscoveryData({
      action,
      hostedUrl: hostedUrl,
      generateBoltUrlWithAllowedScheme,
      hasDiscoveryEndpoint: true
    })

    // Then
    expect(discoveryData).toBeTruthy()
    expect(discoveryData?.SSOProviders?.map(p => p.id)).toEqual([
      'google',
      'lundskommun'
    ])
    // expect(discoveryData?.source).toEqual(CONNECT_FORM)
  })

  test('finds sso providers from all discovery sources and merges if hosts are identical', async () => {
    // Given
    const hasDiscoveryEndpoint = true
    ;[
      { host: sessionStorageHost, providerIds: ['malmöstad'] },
      { host: hostedUrl, providerIds: ['trelleborg'] },
      { host: forceUrl, providerIds: ['göteborg'] },
      { host: discoveryUrl, providerIds: ['petalburg'] }
    ].forEach(({ host, providerIds }) => {
      nock(host)
        .get('/')
        .reply(200, fakeDiscoveryResponse({ providerIds, host: 'bolthost' }))
    })

    const action = {
      ...baseAction,
      discoveryUrl: discoveryUrl,
      forceUrl: forceUrl,
      sessionStorageHost
    }

    // When
    const discoveryData = await getAndMergeDiscoveryData({
      action,
      hostedUrl: hostedUrl,
      generateBoltUrlWithAllowedScheme,
      hasDiscoveryEndpoint
    })

    // Then
    expect(discoveryData).toBeTruthy()
    expect(discoveryData?.host).toEqual('bolthost')
    expect(discoveryData?.SSOProviders?.map(p => p.id)).toEqual([
      'malmöstad',
      'göteborg',
      'petalburg',
      'trelleborg'
    ])
    //expect(discoveryData?.source).toEqual(CONNECT_FORM)
  })

  test('finds sso providers from some providers and merges without overriding', async () => {
    // Given
    const hasDiscoveryEndpoint = true
    ;[
      { host: sessionStorageHost, providerIds: ['malmöstad'] },
      { host: hostedUrl, providerIds: ['trelleborg'] },
      { host: forceUrl, providerIds: ['göteborg'] },
      { host: discoveryUrl, providerIds: ['petalburg'] }
    ].forEach(({ host, providerIds }) => {
      nock(host)
        .get('/')
        .reply(200, fakeDiscoveryResponse({ providerIds, host: 'bolthost' }))
    })

    const action = {
      ...baseAction,
      discoveryUrl: discoveryUrl,
      forceUrl: forceUrl,
      sessionStorageHost
    }

    // When
    const discoveryData = await getAndMergeDiscoveryData({
      action,
      hostedUrl: hostedUrl,
      generateBoltUrlWithAllowedScheme,
      hasDiscoveryEndpoint
    })

    // Then
    expect(discoveryData).toBeTruthy()
    expect(discoveryData?.host).toEqual('bolthost')
    expect(discoveryData?.SSOProviders?.map(p => p.id)).toEqual([
      'malmöstad',
      'göteborg',
      'petalburg',
      'trelleborg'
    ])
    //expect(discoveryData?.source).toEqual(CONNECT_FORM)
  })
})

// Tests yet not written:
// test connect form and connectURL working even when host is missing
// new check
// Correct sso error
// test with weird stuff in localstorage
// check the data that comes form forcde uRL
