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

/* global test, expect */

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
