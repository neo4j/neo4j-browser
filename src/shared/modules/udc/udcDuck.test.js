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

import reducer, { addToEventQueue } from './udcDuck'

test("Doesn't break if there are no events in state", () => {
  // Given
  const initialState = { uuid: 'x' }
  const action = addToEventQueue('my-event', 'now')

  // When
  const state = reducer(initialState, action)

  // Then
  expect(state.events.length).toBe(1)
  expect(state.uuid).toBe('x')
})
test('Can add events', () => {
  // Given
  const initialState = {
    uuid: 'x',
    events: [{ name: 'first-event', data: 1 }]
  }
  const action = addToEventQueue('my-event', 'now')

  // When
  const state = reducer(initialState, action)

  // Then
  expect(state.events.length).toBe(2)
  expect(state.events[0]).toEqual(initialState.events[0])
  expect(state.events[1]).toEqual({ name: 'my-event', data: 'now' })
  expect(state.uuid).toBe('x')
})

test('Limit events in state', () => {
  // Given
  const initialState = { uuid: 'x' }

  // When
  // add 100 events
  let state = reducer(initialState, addToEventQueue('first-event', 'now'))
  for (let i = 0; i < 99; i++) {
    state = reducer(state, addToEventQueue('some-event', 'now'))
  }

  // Then
  expect(state.events.length).toBe(100)
  expect(state.events[0].name).toEqual('first-event')

  // When
  state = reducer(state, addToEventQueue('last-event', 'now'))

  // Then
  expect(state.events.length).toBe(100)
  expect(state.events[0].name).not.toEqual('first-event')
  expect(state.events[99].name).toEqual('last-event')
})
