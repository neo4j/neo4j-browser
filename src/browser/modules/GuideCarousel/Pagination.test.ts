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
import { paginationHelper } from './Pagination'

const D = '...'
describe('Pagination', () => {
  test('paginationHelper', () => {
    // doesn't crash on out of bounds
    expect(paginationHelper(0, 1)).toEqual([])

    // Handles simple cases
    expect(paginationHelper(0, 0)).toEqual([])
    expect(paginationHelper(3, 0)).toEqual([0, 1, 2])
    expect(paginationHelper(6, 4)).toEqual([0, 1, 2, 3, 4, 5])

    // Same for list of 7 regardless of selection
    Array.from({ length: 7 }).forEach((_a, i) => {
      expect(paginationHelper(7, i)).toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    // Handles all cases length 8
    expect(paginationHelper(8, 0)).toEqual([0, 1, 2, 3, 4, D, 7])
    expect(paginationHelper(8, 1)).toEqual([0, 1, 2, 3, 4, D, 7])
    expect(paginationHelper(8, 2)).toEqual([0, 1, 2, 3, 4, D, 7])
    expect(paginationHelper(8, 3)).toEqual([0, 1, 2, 3, 4, D, 7])
    expect(paginationHelper(8, 4)).toEqual([0, D, 3, 4, 5, 6, 7])
    expect(paginationHelper(8, 5)).toEqual([0, D, 3, 4, 5, 6, 7])
    expect(paginationHelper(8, 6)).toEqual([0, D, 3, 4, 5, 6, 7])
    expect(paginationHelper(8, 7)).toEqual([0, D, 3, 4, 5, 6, 7])

    // Handles all cases length 9
    expect(paginationHelper(9, 0)).toEqual([0, 1, 2, 3, 4, D, 8])
    expect(paginationHelper(9, 1)).toEqual([0, 1, 2, 3, 4, D, 8])
    expect(paginationHelper(9, 2)).toEqual([0, 1, 2, 3, 4, D, 8])
    expect(paginationHelper(9, 3)).toEqual([0, 1, 2, 3, 4, D, 8])
    expect(paginationHelper(9, 4)).toEqual([0, D, 3, 4, 5, D, 8])
    expect(paginationHelper(9, 5)).toEqual([0, D, 4, 5, 6, 7, 8])
    expect(paginationHelper(9, 6)).toEqual([0, D, 4, 5, 6, 7, 8])
    expect(paginationHelper(9, 7)).toEqual([0, D, 4, 5, 6, 7, 8])
    expect(paginationHelper(9, 8)).toEqual([0, D, 4, 5, 6, 7, 8])
  })
})
