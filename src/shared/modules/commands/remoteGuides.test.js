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

import { createEpicMiddleware } from 'redux-observable'
import { createBus } from 'suber'
import {
  fetchGuideFromWhitelistAction,
  fetchGuideFromWhitelistEpic
} from './commandsDuck'

jest.mock('services/remote', () => {
  const orig = require.requireActual('services/remote')
  return {
    ...orig,
    get: jest.fn()
  }
})
const remote = require.requireMock('services/remote')

jest.mock('shared/modules/dbMeta/dbMetaDuck', () => {
  const orig = require.requireActual('shared/modules/dbMeta/dbMetaDuck')
  return {
    ...orig,
    getRemoteContentHostnameWhitelist: jest.fn(),
    getDefaultRemoteContentHostnameWhitelist: jest.fn()
  }
})
const dbMeta = require.requireMock('shared/modules/dbMeta/dbMetaDuck')

describe('fetchGuideFromWhitelistEpic', () => {
  afterEach(() => {
    remote.get.mockReset()
    dbMeta.getRemoteContentHostnameWhitelist.mockReset()
    dbMeta.getDefaultRemoteContentHostnameWhitelist.mockReset()
  })

  it('resolves * to default whitelist when looking for a guide', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(fetchGuideFromWhitelistEpic))
    remote.get.mockImplementation(() => Promise.reject(new Error('test')))
    dbMeta.getRemoteContentHostnameWhitelist.mockImplementation(() => '*')
    dbMeta.getDefaultRemoteContentHostnameWhitelist.mockImplementation(
      () => 'testurl1.test, testurl2.test'
    )
    const $$responseChannel = 'test-channel'
    const action = fetchGuideFromWhitelistAction('reco')
    action.$$responseChannel = $$responseChannel
    bus.one($$responseChannel, res => {
      // Then
      expect(dbMeta.getRemoteContentHostnameWhitelist).toHaveBeenCalledTimes(1)
      expect(
        dbMeta.getDefaultRemoteContentHostnameWhitelist
      ).toHaveBeenCalledTimes(1)
      expect(remote.get).toHaveBeenCalledTimes(4) // 2 times per hostname
      expect(remote.get).toHaveBeenCalledWith('http://testurl1.test/reco', {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      })
      expect(remote.get).toHaveBeenCalledWith('https://testurl1.test/reco', {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      })
      expect(remote.get).toHaveBeenCalledWith('http://testurl2.test/reco', {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      })
      expect(remote.get).toHaveBeenCalledWith('https://testurl2.test/reco', {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      })
      done()
    })
    bus.send(action.type, action)
  })
  it('does not change behavior when * isnt involved', done => {
    // Given
    const bus = createBus()
    bus.applyReduxMiddleware(createEpicMiddleware(fetchGuideFromWhitelistEpic))
    remote.get.mockImplementation(() => Promise.reject(new Error('test')))
    dbMeta.getRemoteContentHostnameWhitelist.mockImplementation(
      () => 'configurl1.test'
    )

    dbMeta.getDefaultRemoteContentHostnameWhitelist.mockImplementation(
      () => 'test1.test, test2.test'
    )
    const $$responseChannel = 'test-channel'
    const action = fetchGuideFromWhitelistAction('reco')
    action.$$responseChannel = $$responseChannel
    bus.one($$responseChannel, res => {
      // Then
      expect(dbMeta.getRemoteContentHostnameWhitelist).toHaveBeenCalledTimes(1)
      expect(
        dbMeta.getDefaultRemoteContentHostnameWhitelist
      ).toHaveBeenCalledTimes(1)
      expect(remote.get).toHaveBeenCalledTimes(2)
      expect(remote.get).toHaveBeenCalledWith('http://configurl1.test/reco', {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      })
      expect(remote.get).toHaveBeenCalledWith('https://configurl1.test/reco', {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      })
      done()
    })
    bus.send(action.type, action)
  })
})
