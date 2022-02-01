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
    const initialState = [':help']

    // When
    const nextState = reducer(initialState, helpAction)

    // Then
    expect(nextState).toEqual([':help'])

    // When
    const nextState1 = reducer(nextState, historyAction)

    // Then
    expect(nextState1).toEqual([':history', ':help'])
  })

  test('takes editor.actionTypes.SET_MAX_HISTORY into account', () => {
    const initialState = [':help', ':help', ':help']

    const helpAction = actions.addHistory(':history', 3)
    const nextState = reducer(initialState, helpAction)
    expect(nextState).toEqual([':history', ':help', ':help'])
  })

  test('handles editor.actionTypes.CLEAR_HISTORY', () => {
    // Given
    const initialState = [':emily']
    const anAction = actions.addHistory(':elliot', 3)
    const state = reducer(initialState, anAction)

    // When
    const nextState = reducer(state, actions.clearHistory())

    // Then
    expect(nextState).toEqual([])
  })
})

describe('loads from localstorage', () => {
  it('handles missing stored data', () => {
    expect(actions.loadHistoryFromStorage(undefined)).toEqual([])
  })
  it('handles non list stored data types', () => {
    expect(actions.loadHistoryFromStorage({ tes: 23 })).toEqual([])
    expect(actions.loadHistoryFromStorage('history')).toEqual([])
  })
  it('handles proper stored data', () => {
    expect(actions.loadHistoryFromStorage([])).toEqual([])
    expect(actions.loadHistoryFromStorage(['history'])).toEqual(['history'])
  })
  it('handle a real life store', () => {
    const test = [
      'match (n) return n',
      'MATCH p=()-->() RETURN p LIMIT 25',
      'MATCH (n:Movie) RETURN n LIMIT 25',
      ':server status',
      'MATCH (n) RETURN n LIMIT 100',
      'MATCH (n) RETURN n LIMIT 25',
      'MATCH (n:Movie) RETURN n LIMIT 25',
      'MATCH (n:Movie) RETURN n',
      'MATCH (n:Movie) RETURN n LIMIT 25',
      'MATCH (n) RETURN n',
      "PROFILE \nMATCH p=(n:Movie)--(m:Person)--(o:Movie)\nWHERE m.born > 1000\nAND length(p) > 1\nMATCH (mm:Person) WHERE mm.name STARTS WITH 'T'\nMATCH (mmm:Person) WHERE mmm.name STARTS WITH 'E'\nRETURN p, mm, mmm",
      'PROFILE MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx UNION  MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx UNION  MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx UNION  MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx UNION  MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx UNION  MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx UNION  MATCH (m:Movie), (a:Actor) MATCH (m)--(ax:Actor), (a)--(mx:Movie) RETURN m, a, ax, mx',
      "PROFILE\nWITH ['Action','Drama','Mystery'] AS genreNames\nUNWIND genreNames AS name\nMATCH (g:Genre {name:name})\nWITH g ORDER BY size( (g)<-[:BELONGS_TO]-() ) ASC\nWITH collect(g) AS genres\nWITH head(genres) AS first, tail(genres) AS rest\nMATCH (first)<-[:BELONGS_TO]-(m:Title)-[:BELONGS_TO]->(other)\nWITH m, collect(other) AS movieGenres, rest\nWHERE all(g IN rest WHERE g IN movieGenres)\nRETURN count(m)",
      "PROFILE \nMATCH p=(n:Movie)--(m:Person)--(o:Movie)\nWHERE m.born > 1000\nAND length(p) > 1\nMATCH (mm:Person) WHERE mm.name STARTS WITH 'T'\nMATCH (mmm:Person) WHERE mmm.name STARTS WITH 'E'\nRETURN p, mm, mmm",
      'MATCH (n:Person) RETURN n LIMIT 25',
      'MATCH (n:Movie) RETURN n LIMIT 25',
      'MATCH p=()-->() RETURN p LIMIT 250',
      'MATCH p=()-->() RETURN p LIMIT 25'
    ]
    expect(actions.loadHistoryFromStorage(test)).toEqual(test)
  })
})
