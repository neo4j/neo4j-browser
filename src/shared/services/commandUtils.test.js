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

  test('splitStringOnFirst should split strings on first occurrence of delimiter ', () => {
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

  test('splitStringOnLast should split strings on last occurrence of delimiter ', () => {
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
      expect(`${obj.str}: ${utils.isCypherCommand(obj.str, ':')}`).toEqual(
        `${obj.str}: ${obj.expect}`
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
      { test: '', expect: 'help' },
      { test: 'help', expect: 'help' },
      { test: 'help topic', expect: 'topic' },
      { test: 'help  TOpic ', expect: 'topic' },
      { test: 'help topic me', expect: 'topicMe' },
      { test: 'help topic me now', expect: 'topicMeNow' },
      { test: 'help topic-me', expect: 'topicMe' },
      { test: 'help topic_me', expect: 'topic_me' }
    ]

    // When & Then
    input.forEach(inp => {
      expect(utils.transformCommandToHelpTopic(inp.test)).toEqual(inp.expect)
    })
  })

  describe('mapParamToCypherStatement', () => {
    test('should map string to cypher', () => {
      expect(utils.mapParamToCypherStatement('foo', '"bar"')).toEqual(
        'RETURN "bar" as foo'
      )
    })
    test('should map number to cypher', () => {
      expect(utils.mapParamToCypherStatement('foo', '1337')).toEqual(
        'RETURN 1337 as foo'
      )
    })
    test('should map fn with string to cypher', () => {
      expect(utils.mapParamToCypherStatement('foo', '=> "bar"')).toEqual(
        'RETURN "bar" as foo'
      )
    })
    test('should map fn with numbers to cypher', () => {
      expect(utils.mapParamToCypherStatement('foo', '=> 1 + 1')).toEqual(
        'RETURN 1 + 1 as foo'
      )
    })
    test('should wrap quoted string with backticks', () => {
      expect(utils.mapParamToCypherStatement('"f o o"', '=> 1 + 1')).toEqual(
        'RETURN 1 + 1 as `f o o`'
      )
    })
    test('should wrap quoted string with backticks', () => {
      expect(utils.mapParamToCypherStatement('"f o o"', '=> 1 + 1')).toEqual(
        'RETURN 1 + 1 as `f o o`'
      )
    })
  })
  describe('extractStatementsFromString', () => {
    it('extracts simple statements from a string', () => {
      // Given
      const statements = [
        { stmt: 'RETURN 1', expect: ['RETURN 1'] },
        { stmt: 'RETURN 1;', expect: ['RETURN 1'] },
        { stmt: 'RETURN 1;\nRETURN 2', expect: ['RETURN 1', 'RETURN 2'] },
        {
          stmt: 'RETURN 1; notcommandorcypher;\nRETURN 2',
          expect: ['RETURN 1', 'notcommandorcypher', 'RETURN 2']
        },
        {
          stmt: ':history; RETURN 1;\nMATCH (n)\nRETURN n',
          expect: [':history', 'RETURN 1', 'MATCH (n)\nRETURN n']
        }
      ]

      // When && Then
      statements.forEach(s => {
        expect(utils.extractStatementsFromString(s.stmt)).toEqual(s.expect)
      })
    })
  })

  describe('tryGetRemoteInitialSlideFromUrl', () => {
    it('extracts initial slide hashbangs from a string', () => {
      expect(utils.tryGetRemoteInitialSlideFromUrl('foo#slide-1')).toEqual(1)
      expect(
        utils.tryGetRemoteInitialSlideFromUrl('http://foo.com#slide-2')
      ).toEqual(2)
      expect(
        utils.tryGetRemoteInitialSlideFromUrl(
          'http://www.google.com/yarr/#slide-21'
        )
      ).toEqual(21)
    })
    it('returns 0 when no valid hashbang found', () => {
      expect(utils.tryGetRemoteInitialSlideFromUrl('foo')).toEqual(0)
      expect(
        utils.tryGetRemoteInitialSlideFromUrl('http://foo.com#sloide-2')
      ).toEqual(0)
      expect(
        utils.tryGetRemoteInitialSlideFromUrl(
          'http://www.google.com/yarr/#slide-fooo'
        )
      ).toEqual(0)
    })
  })
})
