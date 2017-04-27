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
import reducer, * as meta from './dbMetaDuck'

describe('updating metadata', () => {
  test('should update state when metadata is updated', () => {
    const returnedLabels = {
      a: 'labels',
      get: (val) => { return ['label1', 'label2'] }
    }
    const returnedRelationshipTypes = {
      a: 'relationshipTypes',
      get: (val) => { return ['rel1', 'rel2'] }
    }
    const returnedProperies = {
      a: 'properties',
      get: (val) => { return ['prop1', 'prop2'] }
    }
    const action = {
      type: meta.UPDATE_META,
      meta: {records: [ returnedLabels, returnedRelationshipTypes, returnedProperies ]},
      context: 'mycontext'
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels).toEqual([{val: 'label1', context: 'mycontext'}, {val: 'label2', context: 'mycontext'}])
    expect(nextState.relationshipTypes).toEqual([{val: 'rel1', context: 'mycontext'}, {val: 'rel2', context: 'mycontext'}])
    expect(nextState.properties).toEqual([{val: 'prop1', context: 'mycontext'}, {val: 'prop2', context: 'mycontext'}])
  })

  test('can update server settings', () => {
    // Given
    const initState = {
      shouldKeep: true
    }
    const action = {
      type: meta.UPDATE_SETTINGS,
      settings: {
        'browser.test': 1
      }
    }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })

  test('can update server info', () => {
    // Given
    const initState = {
      shouldKeep: true
    }
    const action = {
      type: meta.UPDATE_SERVER,
      version: '3.2.0-RC2',
      edition: 'enterprise',
      storeId: 'xxxx'
    }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })

  test('can CLEAR to reset state', () => {
    // Given
    const initState = {
      shouldKeep: false,
      'server': {
        edition: 'enterprise',
        storeId: 'xxxx',
        version: '3.2.0-RC2'
      }
    }
    const action = {
      type: meta.CLEAR
    }

    // When
    const nextState = reducer(initState, action)

    // Then
    expect(nextState).toMatchSnapshot()
  })
})
