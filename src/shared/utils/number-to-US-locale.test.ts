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

/* global describe, test, expect */
import numberToUSLocale from './number-to-US-locale'

describe('numberToUSLocale', () => {
  test('should return the original value if isNaN(value) is true', () => {
    // Given
    const value = null

    // When
    const returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe(value)
  })
  test('should return a non-comma separated number if isNaN(value) is false and 0 <= value < 1000', () => {
    let value, returnValue
    // Given
    value = 0

    // When
    returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe('0')

    // Given
    value = '10'

    // When
    returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe('10')

    // Given
    value = 999

    // When
    returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe('999')
  })
  test('should return a thousands comma separated number if isNaN(value) is false and value >= 1000 ', () => {
    let value, returnValue
    // Given
    value = 1000

    // When
    returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe('1,000')

    // Given
    value = '123456789'

    // When
    returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe('123,456,789')

    // Given
    value = 987654312345

    // When
    returnValue = numberToUSLocale(value)

    // Then
    expect(returnValue).toBe('987,654,312,345')
  })
})
