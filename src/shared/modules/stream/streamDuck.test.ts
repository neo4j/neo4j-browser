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

import reducer, { add, SET_MAX_FRAMES, initialState } from './streamDuck'

describe('streamDuck', () => {
  test('limits the number of frames in the reducer', () => {
    // Given
    const init = { ...initialState, maxFrames: 1 }
    const action = add({ cmd: 'xxx', id: 1 })
    const action2 = add({ cmd: 'yyy', id: 2 })

    // When
    const newState = reducer(init, action)

    // Then
    expect(newState.allIds.length).toBe(1)

    // When
    const newState2 = reducer(newState, action2)

    // Then
    expect(newState2.allIds.length).toBe(1)
  })
  test('cuts the number of frames when config is set', () => {
    // Given
    const init = {
      ...initialState,
      maxFrames: 2,
      allIds: [1, 2],
      byId: { 1: { stack: [{ id: 1 }] }, 2: { stack: [{ id: 2 }] } }
    }
    const action = { type: SET_MAX_FRAMES, maxFrames: 1 }

    // When
    const newState = reducer(init, action)

    // Then
    expect(newState.allIds.length).toBe(1)
    expect(newState.allIds).toMatchSnapshot()
    expect(newState.byId).toMatchSnapshot()
  })
  test('dont remove pinned frames when cutting frames', () => {
    // Given
    const byId = {
      1: { stack: [{}], isPinned: 1 },
      2: { stack: [{}], isPinned: 1 }
    }
    const init = { ...initialState, maxFrames: 2, allIds: [1, 2], byId }
    const action = { type: SET_MAX_FRAMES, maxFrames: 1 }

    // When
    const newState = reducer(init, action)

    // Then
    expect(newState.allIds.length).toBe(2)
    expect(newState.allIds).toMatchSnapshot()
    expect(newState.byId).toMatchSnapshot()
  })
  test('saves a stack of same ids', () => {
    const ID = 'test-id'
    const BEFORE = 'before'
    const AFTER = 'after'
    const byId = { [ID]: { stack: [{ type: BEFORE }] }, 2: { stack: [{}] } }
    const init = { ...initialState, allIds: [ID, 2], byId }
    const action = add({ id: ID, type: AFTER })

    // Then
    expect(init.byId).toMatchInlineSnapshot(`
      Object {
        "2": Object {
          "stack": Array [
            Object {},
          ],
        },
        "test-id": Object {
          "stack": Array [
            Object {
              "type": "before",
            },
          ],
        },
      }
    `)
    // When
    const newState = reducer(init, action)

    // Then
    expect(newState.allIds.length).toBe(2)
    expect(newState.byId).toMatchInlineSnapshot(`
      Object {
        "2": Object {
          "stack": Array [
            Object {},
          ],
        },
        "test-id": Object {
          "stack": Array [
            Object {
              "id": "test-id",
              "type": "after",
            },
            Object {
              "type": "before",
            },
          ],
        },
      }
    `)
  })
})
