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
import reducer, * as actions from './historyDuck'

describe('editor reducer', () => {
  test('handles editor.actionTypes.ADD_HISTORY', () => {
    const helpAction = actions.addHistory(':help', 20)
    const nextState = reducer(undefined, helpAction)
    expect(nextState).toEqual([':help'])

    // One more time
    const historyAction = actions.addHistory(':history', 20)
    const nextnextState = reducer(nextState, historyAction)
    expect(nextnextState).toEqual([':history', ':help'])
  })
  test('editor.actionTypes.ADD_HISTORY does not repeat two entries in a row', () => {
    // Given
    const helpAction = actions.addHistory(':help', 20)
    const historyAction = actions.addHistory(':history', 20)
    const initalState = [':help']

    // When
    const nextState = reducer(initalState, helpAction)

    // Then
    expect(nextState).toEqual([':help'])

    // When
    const nextState1 = reducer(nextState, historyAction)

    // Then
    expect(nextState1).toEqual([':history', ':help'])
  })

  test('takes editor.actionTypes.SET_MAX_HISTORY into account', () => {
    const initalState = [':help', ':help', ':help']

    const helpAction = actions.addHistory(':history', 3)
    const nextState = reducer(initalState, helpAction)
    expect(nextState).toEqual([':history', ':help', ':help'])
  })
})
