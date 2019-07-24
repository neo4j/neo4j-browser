/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

/* global, describe, test, expect */

import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import { connectionTimeoutHelper } from './connectionHelpers'

describe('connectionTimeoutHelper', () => {
  test('returns connectionTimeout setting value if setting exists', () => {
    const connectionTimeout = Math.floor(Math.random() * 1000)
    const state = {
      settings: {
        connectionTimeout
      }
    }
    const timeout = connectionTimeoutHelper(state, '')
    expect(timeout).toEqual(connectionTimeout)
  })
  test('returns 10000ms host has cloud domain', () => {
    const state = {
      settings: {}
    }
    const timeout = connectionTimeoutHelper(
      state,
      `bolt+routing://10763f30-databases.${NEO4J_CLOUD_DOMAINS[0]}`
    )
    expect(timeout).toEqual(10000)
  })
  test('returns 10000ms host has cloud domain before port', () => {
    const state = {
      settings: {}
    }
    const timeout = connectionTimeoutHelper(
      state,
      `bolt+routing://10763f30-databases.${NEO4J_CLOUD_DOMAINS[0]}:7687`
    )
    expect(timeout).toEqual(10000)
  })
  test('returns 5000ms if host does not include cloud domain', () => {
    const state = {
      settings: {}
    }
    const timeout = connectionTimeoutHelper(state, 'host')
    expect(timeout).toEqual(5000)
  })
})
