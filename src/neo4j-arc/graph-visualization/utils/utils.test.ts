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
import { selectorArrayToString, selectorStringToArray } from './utils'

describe('selectors', () => {
  test('selectorStringToArray unescapes selectors with . in them', () => {
    const tests = [
      { test: 'foo', expect: ['foo'] },
      { test: 'foo.bar', expect: ['foo', 'bar'] },
      { test: 'foo.bar.baz', expect: ['foo', 'bar', 'baz'] },
      { test: 'foo\\.bar', expect: ['foo.bar'] },
      { test: 'foo\\.bar\\.baz', expect: ['foo.bar.baz'] },
      { test: 'foo\\.bar.baz\\.baz', expect: ['foo.bar', 'baz.baz'] },
      {
        test: 'node.foo\\.bar\\.baz.bax',
        expect: ['node', 'foo.bar.baz', 'bax']
      }
    ]

    tests.forEach(t => {
      expect(selectorStringToArray(t.test)).toEqual(t.expect)
    })
  })
  test('selectorArrayToString escapes selectors with . in them', () => {
    const tests = [
      { expect: 'foo', test: ['foo'] },
      { expect: 'foo.bar', test: ['foo', 'bar'] },
      { expect: 'foo.bar.baz', test: ['foo', 'bar', 'baz'] },
      { expect: 'foo\\.bar', test: ['foo.bar'] },
      { expect: 'foo\\.bar\\.baz', test: ['foo.bar.baz'] },
      { expect: 'foo\\.bar.baz\\.baz', test: ['foo.bar', 'baz.baz'] },
      {
        expect: 'node.foo\\.bar\\.baz.bax',
        test: ['node', 'foo.bar.baz', 'bax']
      }
    ]

    tests.forEach(t => {
      expect(selectorArrayToString(t.test)).toEqual(t.expect)
    })
  })
})
