/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

/* global describe, test, expect */
import reducer, * as features from './featuresDuck'
import { dehydrate } from 'services/duckUtils'

describe('features reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, { type: '' })
    expect(dehydrate(nextState)).toEqual({
      availableProcedures: [],
      browserSync: true
    })
  })

  test('handles UPDATE_ALL_FEATURES without initial state', () => {
    const action = {
      type: features.UPDATE_ALL_FEATURES,
      availableProcedures: ['proc']
    }
    const nextState = reducer(undefined, action)
    expect(nextState.availableProcedures).toEqual(['proc'])
    expect(nextState.browserSync).toEqual(true)
  })

  test('handles UPDATE_ALL_FEATURES', () => {
    const initialState = { availableProcedures: ['a', 'b'] }
    const action = {
      type: features.UPDATE_ALL_FEATURES,
      availableProcedures: ['c']
    }
    const nextState = reducer(initialState, action)
    expect(nextState.availableProcedures).toEqual(['c'])
  })
})

describe('feature getters', () => {
  test('should return empty list of availableProcedures by default', () => {
    const nextState = reducer(undefined, { type: '' })
    expect(features.getAvailableProcedures({ features: nextState })).toEqual([])
  })
  test('should return list of availableProcedures', () => {
    const nextState = reducer(
      { availableProcedures: ['foo.bar'] },
      { type: '' }
    )
    expect(features.getAvailableProcedures({ features: nextState })).toContain(
      'foo.bar'
    )
  })
  test('should not be a causal cluster', () => {
    const nextState = reducer(undefined, { type: '' })
    expect(features.isACausalCluster({ features: nextState })).toBe(false)
  })
  test('should be in a causal cluster', () => {
    const nextState = reducer(
      { availableProcedures: ['dbms.cluster.overview'] },
      { type: '' }
    )
    expect(features.isACausalCluster({ features: nextState })).toBe(true)
  })
  test('should not be able to assign roles to user', () => {
    const nextState = reducer(undefined, { type: '' })
    expect(features.canAssignRolesToUser({ features: nextState })).toBe(false)
  })
  test('should be able to assign roles to user', () => {
    const nextState = reducer(
      { availableProcedures: ['dbms.security.addRoleToUser'] },
      { type: '' }
    )
    expect(features.canAssignRolesToUser({ features: nextState })).toBe(true)
  })
})
