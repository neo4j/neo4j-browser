/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

/* global describe, test, expect */
import * as utils from './commandUtils'

describe('commandutils', () => {
  test('stripCommandComments should remove lines starting with a comment ', () => {
    const testStrs = [
      '//This is a comment\nRETURN 1',
      '// Another comment\nRETURN 1',
      '// Another comment\nRETURN 1\n//Next comment'
    ]
    testStrs.forEach((str) => {
      expect(utils.stripCommandComments(str)).toEqual('RETURN 1')
    })
  })

  test('stripEmptyCommandLines should remove empty lines ', () => {
    const testStrs = [
      '\n\n     \nRETURN 1',
      '   \n\nRETURN 1\n  \n\n',
      'RETURN \n\n 1\n'
    ]
    testStrs.forEach((str) => {
      expect(utils.stripEmptyCommandLines(str)).toEqual('RETURN 1')
    })
  })

  test('splitStringOnFirst should split strings on first occurance of delimiter ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', delimiter: ' ', expect: [':config', 'test:"hello :space"']},
      {str: 'test:"hello :space"', delimiter: ':', expect: ['test', '"hello :space"']}
    ]
    testStrs.forEach((obj) => {
      expect(utils.splitStringOnFirst(obj.str, obj.delimiter)).toEqual(obj.expect)
    })
  })

  test('splitStringOnLast should split strings on last occurance of delimiter ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', delimiter: ' ', expect: [':config test:"hello', ':space"']},
      {str: 'test:"hello :space"', delimiter: ':', expect: ['test:"hello ', 'space"']}
    ]
    testStrs.forEach((obj) => {
      expect(utils.splitStringOnLast(obj.str, obj.delimiter)).toEqual(obj.expect)
    })
  })

  test('extractCommandParameters should create an object from string input ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', expect: {test: 'hello :space'}},
      {str: ':config test:10', expect: {test: 10}},
      {str: ':config my test:10', expect: {'my test': 10}},
      {str: ':config `my:test`: 10', expect: {'my:test': 10}},
      {str: ':config test:null', expect: {test: null}},
      {str: ':config test:""', expect: {test: ''}},
      {str: ':config test: 10', expect: {test: 10}}, // space before value
      {str: ':config test:`hello " there`', expect: {test: 'hello " there'}},
      {str: ':config test:{x: "h"}', expect: {test: {x: 'h'}}},
      {str: ':config test:[1, 2, false, [3, 4, true]]', expect: {test: [1, 2, false, [3, 4, true]]}},
      {str: ':config {test: 10}', expect: false}, // Cannot parse object directly
      {str: ':config test', expect: false} // Not valid
    ]
    testStrs.forEach((obj) => {
      expect(utils.extractCommandParameters(':config', obj.str)).toEqual(obj.expect)
    })
  })
  test('parseCommandJSON should parse input as an object ', () => {
    const testStrs = [
      {str: ':config {test: 10}', expect: {test: 10}},
      {str: ':config {test: [1, 2, false, [4, 5]]}', expect: {test: [1, 2, false, [4, 5]]}},
      {str: ':config {test: 1, b: {x: "hej"}}', expect: {test: 1, b: {x: 'hej'}}},
      {str: ':config test:1', expect: false}, // Not valid
      {str: ':config null', expect: false}, // Not valid
      {str: ':config test', expect: false} // Not valid
    ]
    testStrs.forEach((obj) => {
      expect(utils.parseCommandJSON(':config', obj.str)).toEqual(obj.expect)
    })
  })
  test('isCypherCommand should treat everything not starting with : as cypher', () => {
    const testStrs = [
      {str: ':config {test: 10}', expect: false},
      {str: 'return 1', expect: true},
      {str: '//:hello\nRETURN 1', expect: true},
      {str: '   RETURN 1', expect: true}
    ]
    testStrs.forEach((obj) => {
      expect(obj.str + ': ' + utils.isCypherCommand(obj.str, ':')).toEqual(obj.str + ': ' + obj.expect)
    })
  })
})
