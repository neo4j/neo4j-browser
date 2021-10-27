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

import nock from 'nock'
import 'isomorphic-fetch'

import { getAndMergeDiscoveryData } from './discoveryHelpers'
import { fakeDiscoveryResponse } from './discoveryMocks'
// int8 a felmeddelanden och använd dem i testerna

describe('getAndMergeDiscoveryData', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  test('prioritises session storage data highest', async () => {
    const logs: string[] = []
    console.log = (text: string) => logs.push(text)
    // Given
    const sessionStorageHost = 'http://sessionStorageHost.com'
    const hostedURL = 'http://hostedURL.com'
    const forceURL = 'http://forceURL.com'
    const discoveryURL = 'http://discoveryURL.com'
    ;[hostedURL, forceURL, discoveryURL].forEach(host =>
      nock(host)
        .get('/')
        .reply(200, fakeDiscoveryResponse(['azure'], 'bolthost'))
    )

    nock(sessionStorageHost)
      .get('/')
      .reply(200, fakeDiscoveryResponse(['google'], 'bolthost'))

    const action = {
      discoveryURL,
      forceURL,
      sessionStorageHost,
      encrypted: false,
      requestedUseDb: '',
      restApi: ''
    }
    const generateBoltUrlWithAllowedScheme = (s: string) => s
    const hasDiscoveryEndpoint = true

    // When
    const { success, discoveryData } = await getAndMergeDiscoveryData({
      action,
      hostedURL,
      generateBoltUrlWithAllowedScheme,
      hasDiscoveryEndpoint
    })

    // Then
    // Asserta på logs som variabler
    //expect(logs.join('\n')).toBe({})
    expect(success).toBe(true)
    expect(discoveryData).toEqual({})
  })
})
