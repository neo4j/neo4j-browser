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

/* global describe, test, expect */
import * as utils from './commandUtils'

describe('commandutils', () => {
  test('stripCommandComments should remove lines starting with a comment ', () => {
    const testStrs = [
      '//This is a comment\nRETURN 1',
      '// Another comment\nRETURN 1',
      '// Another comment\nRETURN 1\n//Next comment'
    ]
    testStrs.forEach(str => {
      expect(utils.stripCommandComments(str)).toEqual('RETURN 1')
    })
  })

  test('stripEmptyCommandLines should remove empty lines ', () => {
    const testStrs = ['\n\n     \nRETURN 1', '   \n\nRETURN 1\n  \n\n']
    testStrs.forEach(str => {
      expect(utils.stripEmptyCommandLines(str)).toEqual('RETURN 1')
    })
  })

  test('stripEmptyCommandLines should preserve usual newlines ', () => {
    const testStrs = ['MATCH (n)\nRETURN n']
    testStrs.forEach(str => {
      expect(utils.stripEmptyCommandLines(str)).toEqual('MATCH (n)\nRETURN n')
    })
  })

  test('splitStringOnFirst should split strings on first occurance of delimiter ', () => {
    const testStrs = [
      {
        str: ':config test:"hello :space"',
        delimiter: ' ',
        expect: [':config', 'test:"hello :space"']
      },
      {
        str: 'test:"hello :space"',
        delimiter: ':',
        expect: ['test', '"hello :space"']
      }
    ]
    testStrs.forEach(obj => {
      expect(utils.splitStringOnFirst(obj.str, obj.delimiter)).toEqual(
        obj.expect
      )
    })
  })

  test('splitStringOnLast should split strings on last occurance of delimiter ', () => {
    const testStrs = [
      {
        str: ':config test:"hello :space"',
        delimiter: ' ',
        expect: [':config test:"hello', ':space"']
      },
      {
        str: 'test:"hello :space"',
        delimiter: ':',
        expect: ['test:"hello ', 'space"']
      }
    ]
    testStrs.forEach(obj => {
      expect(utils.splitStringOnLast(obj.str, obj.delimiter)).toEqual(
        obj.expect
      )
    })
  })

  test('isCypherCommand should treat everything not starting with : as cypher', () => {
    const testStrs = [
      { str: ':config {test: 10}', expect: false },
      { str: 'return 1', expect: true },
      { str: '//:hello\nRETURN 1', expect: true },
      { str: '   RETURN 1', expect: true }
    ]
    testStrs.forEach(obj => {
      expect(obj.str + ': ' + utils.isCypherCommand(obj.str, ':')).toEqual(
        obj.str + ': ' + obj.expect
      )
    })
  })
  test('extractPostConnectCommandsFromServerConfig should split and return an array of commands', () => {
    // Given
    const testStrs = [
      { str: '', expect: undefined },
      { str: ';;;;;;;;', expect: undefined },
      { str: ':play cypher', expect: [':play cypher'] },
      { str: '    :play cypher     ', expect: [':play cypher'] },
      { str: ':play cypher;', expect: [':play cypher'] },
      { str: ':play cypher ;', expect: [':play cypher'] },
      { str: ';:play cypher;', expect: [':play cypher'] },
      {
        str: ':play cypher; :param x: 1',
        expect: [':play cypher', ':param x: 1']
      },
      {
        str: 'RETURN 1; RETURN 3; :play start',
        expect: ['RETURN 1', 'RETURN 3', ':play start']
      },
      {
        str: 'MATCH (n: {foo: "bar;", bar: "foo;"}) RETURN n',
        expect: ['MATCH (n: {foo: "bar;", bar: "foo;"}) RETURN n']
      },
      {
        str: "MATCH (n: {foo: 'bar;'}) RETURN n",
        expect: ["MATCH (n: {foo: 'bar;'}) RETURN n"]
      },
      {
        str: 'MATCH (n: {foo: `bar;`}) RETURN n',
        expect: ['MATCH (n: {foo: `bar;`}) RETURN n']
      },
      {
        str: 'MATCH (n: {foo: `bar;;`}) RETURN n',
        expect: ['MATCH (n: {foo: `bar;;`}) RETURN n']
      },
      {
        str: ':play cypher; MATCH (n: {foo: `bar; en;`}) RETURN n',
        expect: [':play cypher', 'MATCH (n: {foo: `bar; en;`}) RETURN n']
      }
    ]

    // When & Then
    testStrs.forEach(item => {
      expect(
        utils.extractPostConnectCommandsFromServerConfig(item.str)
      ).toEqual(item.expect)
    })
  })
  test('transformCommandToHelpTopic transforms input to help topics', () => {
    // Given
    const input = [
      { test: '', expect: '_help' },
      { test: 'help', expect: '_help' },
      { test: 'help topic', expect: '_topic' },
      { test: 'help  TOpic ', expect: '_topic' },
      { test: 'help topic me', expect: '_topicMe' },
      { test: 'help topic me now', expect: '_topicMeNow' },
      { test: 'help topic-me', expect: '_topicMe' },
      { test: 'help topic_me', expect: '_topic_me' }
    ]

    // When & Then
    input.forEach(inp => {
      expect(utils.transformCommandToHelpTopic(inp.test)).toEqual(inp.expect)
    })
  })
})
