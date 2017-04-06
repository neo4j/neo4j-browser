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

/* global test, expect */
import reducer, { UPDATE_LABELS, UPDATE_GRAPH_STYLE_DATA } from './visualizationDuck'

describe('visualization reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.labels).toHaveLength(0)
    expect(nextState.styleData).toBeNull()
  })

  test('handles UPDATE_LABELS without initial state', () => {
    const action = {
      type: UPDATE_LABELS,
      labels: ['Person']
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels[0]).toEqual('Person')
    expect(nextState.styleData).toBeNull()
  })

  test('handles UPDATE_LABELS', () => {
    const initialState = { labels: ['Person'], styleData: 'style' }
    const action = {
      type: UPDATE_LABELS,
      labels: ['Movie']
    }
    const nextState = reducer(initialState, action)
    expect(nextState.labels[0]).toEqual('Movie')
    expect(nextState.labels).toHaveLength(1)
    expect(nextState.styleData).toEqual('style')
  })

  test('handles UPDATE_GRAPH_STYLE_DATA without initial state', () => {
    const action = {
      type: UPDATE_GRAPH_STYLE_DATA,
      styleData: 'style updated'
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels).toHaveLength(0)
    expect(nextState.styleData).toEqual('style updated')
  })

  test('handles UPDATE_GRAPH_STYLE_DATA', () => {
    const initialState = { labels: ['Person'], styleData: 'style' }
    const action = {
      type: UPDATE_GRAPH_STYLE_DATA,
      styleData: 'style updated again'
    }
    const nextState = reducer(initialState, action)
    expect(nextState.labels[0]).toEqual('Person')
    expect(nextState.labels).toHaveLength(1)
    expect(nextState.styleData).toEqual('style updated again')
  })
})
