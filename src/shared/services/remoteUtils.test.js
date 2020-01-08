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

import * as utils from './remoteUtils'

describe('remoteUtils', () => {
  test('removes script tags', () => {
    const text = 'hello<script>alert(1)</script> <p onclick="alert(1)">test</p>'
    expect(utils.cleanHtml(text)).toEqual('hello <p>test</p>')
  })
  test('removes script from href', () => {
    const doubleQuoted = 'hello <a href="javascript:alert(1)">test</a>'
    expect(utils.cleanHtml(doubleQuoted)).toEqual('hello <a href="">test</a>')

    const singleQuoted = "hello <a href='javascript:alert(1)'>test</a>"
    expect(utils.cleanHtml(singleQuoted)).toEqual("hello <a href=''>test</a>")
  })
  test('removes on* handlers from html', () => {
    const text = 'hello <div onclick="foobar">test</div>'
    expect(utils.cleanHtml(text)).toEqual('hello <div>test</div>')
  })
  test('isLocalRequest figures out if a request is local or remote', () => {
    // Given
    const itemsStrict = [
      { local: undefined, request: '/yo', expect: false },
      { local: 'http://hej.com', request: '/yo', expect: true },
      { local: 'http://hej.com', request: 'http://hej.com/yo', expect: true },
      {
        local: 'http://hej.com:8080',
        request: 'http://hej.com:9000/mine',
        expect: false
      },
      { local: 'http://hej.com', request: 'https://hej.com', expect: false },
      { local: 'http://hej.com', request: 'http://bye.com', expect: false }
    ]
    const itemsHostnameOnly = [
      { local: undefined, request: '/yo', expect: false },
      { local: 'http://hej.com', request: '/yo', expect: true },
      { local: 'http://hej.com', request: 'http://hej.com/yo', expect: true },
      {
        local: 'http://hej.com:8080',
        request: 'http://hej.com:9000/mine',
        expect: true
      },
      { local: 'http://hej.com', request: 'https://hej.com', expect: true },
      { local: 'http://hej.com', request: 'http://bye.com', expect: false },
      {
        local: 'bolt://hej.com:7687',
        request: 'http://hej.com:7474',
        expect: true
      }
    ]

    // When && Then
    itemsStrict.forEach(item => {
      expect(utils.isLocalRequest(item.local, item.request)).toBe(item.expect)
    })
    itemsHostnameOnly.forEach(item => {
      expect(
        utils.isLocalRequest(item.local, item.request, { hostnameOnly: true })
      ).toBe(item.expect)
    })
  })
})
