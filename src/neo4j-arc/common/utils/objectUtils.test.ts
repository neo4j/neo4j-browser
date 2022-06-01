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
import { deepEquals } from 'neo4j-arc/common'

describe('objectUtils', () => {
  test('can deeply compare objects', () => {
    // Given
    const o1 = { a: 'a', b: 'b', c: { c: 'c' } }
    const o2 = { ...o1 }
    const o3 = { ...o1, c: { c: 'd' } }
    const o4 = { ...o1, d: { e: { f: 'g' } } }
    const o5 = { ...o1, d: { e: { f: 'g' } } }

    // When & Then
    expect(deepEquals(o1, o2)).toBeTruthy()
    expect(deepEquals(o1, o3)).toBeFalsy()
    expect(deepEquals(o4, o5)).toBeTruthy()
  })
  test('deepEquals compares object methods by source instead of by reference', () => {
    const foo1 = { someMethod: () => 'foo' }
    const foo2 = { someMethod: () => 'foo' }
    const bar = { someMethod: () => 'bar' }

    expect(deepEquals(foo1, foo2)).toBeTruthy()
    expect(deepEquals(foo1, bar)).toBeFalsy()
  })
})
