/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { CSVSerializer } from './serializer'

describe('resultTransform', () => {
  describe('CSV', () => {
    test('should serialize array to CSV', () => {
      const cols = ['col1', 'col2']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('col1,col2')
    })
    test('should escape quote with double quote in columns', () => {
      const cols = ['col1', '"col2"']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('col1,"""col2"""')
    })
    test("should throw exception when row doesn't match columns", () => {
      const cols = ['col1', '"col2"']
      const s = CSVSerializer(cols)
      expect(() => s.append(['x'])).toThrowError('Column number mismatch')
    })
    test('should throw exception when row is empty in multi column env', () => {
      const cols = ['col1', '"col2"']
      const s = CSVSerializer(cols)
      expect(() => s.append()).toThrowError('Column number mismatch')
    })
    test('should not throw exception when row is empty in one column env', () => {
      const cols = ['col1']
      const s = CSVSerializer(cols)
      expect(() => s.append(null)).not.toThrow()
    })
    test('should insert a line break for each row', () => {
      const cols = ['col1', '"col2"']
      const data = ['data1', 'data2']
      const s = CSVSerializer(cols)
      s.append(data)
      expect(s.output().split('\n').length).toEqual(2)
    })
    test('should take many rows at once with appendRows', () => {
      const cols = ['col1', '"col2"']
      const data = [['data1', 'data2'], ['data3', 'data4']]
      const s = CSVSerializer(cols)
      s.appendRows(data)
      expect(s.output().split('\n').length).toEqual(3)
    })
    test('should escape delimiter characters in data', () => {
      const cols = ['column, first', 'column, second']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('"column, first","column, second"')
    })
    test('should both escape and quote data', () => {
      const cols = ['column, "first"', 'column, "second"']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('"column, ""first""","column, ""second"""')
    })
    test('should not strip whitespace in data', () => {
      const cols = [' column', ' column2 ']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual(' column, column2 ')
    })
    test('should represent null values as null', () => {
      const cols = [null, 'col']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual(',col')
    })
    test('should represent empty values as ""', () => {
      const cols = ['', 'col']
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('"",col')
    })
    test('should represent boolean values as "true" and "false"', () => {
      const cols = [true, false]
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('true,false')
    })
    test('should represent Object values as JSON', () => {
      const cols = [{ name: 'John' }]
      const s = CSVSerializer(cols)
      expect(s.output()).toEqual('"{""name"":""John""}"')
    })
  })
})
