/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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
import reducer, { UPDATE_ALL_FEATURES } from './featuresDuck'
import { dehydrate } from 'services/duckUtils'

describe('features reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(dehydrate(nextState)).toEqual({availableProcedures: []})
  })

  test('handles UPDATE_ALL_FEATURES without initial state', () => {
    const action = {
      type: UPDATE_ALL_FEATURES,
      availableProcedures: ['proc']
    }
    const nextState = reducer(undefined, action)
    expect(nextState.availableProcedures).toEqual(['proc'])
  })

  test('handles UPDATE_ALL_FEATURES', () => {
    const initialState = { availableProcedures: ['a', 'b'] }
    const action = {
      type: UPDATE_ALL_FEATURES,
      availableProcedures: ['c']
    }
    const nextState = reducer(initialState, action)
    expect(nextState.availableProcedures).toEqual(['c'])
  })
})
