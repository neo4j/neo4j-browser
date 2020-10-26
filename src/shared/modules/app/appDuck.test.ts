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

import reducer, { NAME, APP_START, getHostedUrl } from './appDuck'

test('reducer stores hostedUrl', () => {
  // Given
  const url = 'xxx'
  const initState = {}
  const action = { type: APP_START, url }

  // When
  const state = reducer(initState, action)

  // Then
  expect(state.hostedUrl).toEqual(url)
})

test('selector getHostedUrl returns whats in the store', () => {
  // Given
  const url = 'xxx'
  const initState = {}
  const action = { type: APP_START, url }

  // Then
  expect(getHostedUrl({ [NAME]: initState })).toEqual(null)

  // When
  const state = reducer(initState, action)

  // Then
  expect(getHostedUrl({ [NAME]: state })).toEqual(url)
})
