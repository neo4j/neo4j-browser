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

/* global describe, test, expect */
import reducer, * as jmx from './jmxDuck'
import { APP_START } from 'shared/modules/app/appDuck'

describe('hydrating state', () => {
  test('should merge inital state and state on load', () => {
    // Given
    const action = { type: APP_START }
    const state = [{ foo: 'bar' }]

    // When
    const hydratedState = reducer(state, action)

    // Then
    expect(hydratedState).toEqual(state)
  })
})
describe('updating jmx', () => {
  test('should update state when jmx is updated', () => {
    // Given
    const action = {
      type: jmx.UPDATE_JMX_VALUES,
      values: []
    }

    // When
    let nextState = reducer(undefined, action)

    // Then
    expect(nextState).toEqual([])

    // Given
    const updatedJmxValues = {
      type: jmx.UPDATE_JMX_VALUES,
      values: [{ foo: 'bar' }, { abc: 'xyz' }]
    }

    // When
    nextState = reducer(nextState, updatedJmxValues)

    // Then
    expect(nextState).toEqual([{ foo: 'bar' }, { abc: 'xyz' }])
  })
})

describe('reading jmx', () => {
  test('should return specific jmx values from state', () => {
    const NumberOfRolledBackTransactions = {
      description: 'The total number of rolled back transactions',
      value: '396'
    }
    const value = {
      name: 'org.neo4j:instance=kernel#0,name=Transactions',
      description: 'Information about the Neo4j transaction manager',
      attributes: {
        NumberOfRolledBackTransactions,
        NumberOfOpenTransactions: {
          description: 'The number of currently open transactions',
          value: '1'
        }
      }
    }
    const state = reducer([value])
    const jmxValues = jmx.getJmxValues({ jmx: state }, [
      ['Transactions', 'NumberOfRolledBackTransactions']
    ])
    expect(jmxValues).toHaveLength(1)
    expect(jmxValues).toContainEqual({
      NumberOfRolledBackTransactions: NumberOfRolledBackTransactions.value
    })
  })
})
