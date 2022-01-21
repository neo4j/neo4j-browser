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
import reducer, {
  ENSURE_MAX_FRAMES,
  EnsureMaxFramesAction,
  FramesState,
  add,
  initialState
} from './framesDuck'

describe('framesDuck', () => {
  test('can limit frames count', () => {
    // Given
    const init: FramesState = {
      ...initialState,
      allIds: ['1', '2'],
      byId: {
        1: { isPinned: false, stack: [] },
        2: { isPinned: false, stack: [] }
      }
    }
    const action: EnsureMaxFramesAction = {
      type: ENSURE_MAX_FRAMES,
      maxFrames: 1
    }

    // When
    const newState = reducer(init, action)

    // Then
    const expectedState: FramesState = {
      ...init,
      allIds: ['1'],
      byId: { 1: { isPinned: false, stack: [] } }
    }
    expect(newState.allIds.length).toBe(1)
    expect(newState).toEqual(expectedState)
  })
  test('dont remove pinned frames when cutting frames', () => {
    // Given
    const byId = {
      1: { stack: [], isPinned: true },
      2: { stack: [], isPinned: true }
    }
    const init: FramesState = { ...initialState, allIds: ['1', '2'], byId }
    const action: EnsureMaxFramesAction = {
      type: ENSURE_MAX_FRAMES,
      maxFrames: 1
    }

    // When
    const newState = reducer(init, action)

    // Then
    expect(newState.allIds.length).toBe(2)
    expect(newState).toEqual(init)
  })
  test('saves a stack of same ids', () => {
    const ID = 'test-id'
    const BEFORE = 'before'
    const AFTER = 'after'
    const byId = { [ID]: { stack: [{ type: BEFORE }] }, 2: { stack: [{}] } }
    const init: any = { ...initialState, allIds: [ID, '2'], byId }
    const action = add({ id: ID, type: AFTER } as any)

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
              "history": Array [],
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
