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

import helper from './commandInterpreterHelper'

describe('commandInterpreterHelper', () => {
  describe('discover commands', () => {
    test('should recognize :clear command', () => {
      // Given
      const cmd = 'clear'
      const expectedCommandName = 'clear'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should find :config helper with params', () => {
      // Given
      const cmd = 'config cmdchar:"/"'
      const expectedCommandName = 'config'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should find :play helper with params', () => {
      // Given
      const cmd = 'play fileLocation'
      const expectedCommandName = 'play'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should find :play `url` helper with params', () => {
      // Given
      const cmd = 'play http://neo4j.com'
      const expectedCommandName = 'play-remote'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should give the "catch-all" match back with unknown command', () => {
      // Given
      const cmd = 'nomatch'
      const expectedCommandName = 'catch-all'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should be case insensitive for browser commands', () => {
      // Given
      const cmd = 'PlaY anyThing'
      const expectedCommandName = 'play'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })
  })
})
