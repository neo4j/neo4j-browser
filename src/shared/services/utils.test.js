/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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

/* global jest, describe, test, expect */
import * as utils from './utils'

describe('utils', () => {
  test('can deeply compare objects', () => {
    // Given
    const o1 = {a: 'a', b: 'b', c: {c: 'c'}}
    const o2 = {...o1}
    const o3 = {...o1, c: {c: 'd'}}

    // When & Then
    expect(utils.deepEquals(o1, o2)).toBeTruthy()
    expect(utils.deepEquals(o1, o3)).toBeFalsy()
  })
  test('can move items in an array', () => {
    // Given
    const tests = [
      { test: [1, 2, 3], from: -1, to: 1, expect: false },
      { test: [1, 2, 3], from: 0, to: 3, expect: false },
      { test: [1, 2, 3], from: 5, to: 1, expect: false },
      { test: 'string', from: 0, to: 3, expect: false },
      { test: [1, 2, 3], from: 0, to: 1, expect: [2, 1, 3] },
      { test: [1, 2, 3], from: 2, to: 1, expect: [1, 3, 2] },
      { test: [1, 2, 3], from: 2, to: 0, expect: [3, 1, 2] }
    ]

    // When && Then
    tests.forEach((t) => {
      expect(utils.moveInArray(t.from, t.to, t.test)).toEqual(t.expect)
    })
  })
  test('debounces function calls', () => {
    // Given
    jest.useFakeTimers()
    const fn = jest.fn()
    const fn2 = jest.fn()
    const dbFn = utils.debounce(fn, 500)
    const dbFn2 = utils.debounce(fn2, 500)

    // When
    dbFn(4, 5, 6)
    dbFn(1, 2, 3)
    jest.runAllTimers()
    dbFn2(1, 2, 3)
    jest.runAllTimers()
    dbFn2(4, 5, 6)
    jest.runAllTimers()

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1, 2, 3)
    expect(fn2).toHaveBeenCalledTimes(2)
    expect(fn2).toHaveBeenCalledWith(1, 2, 3)
    expect(fn2).toHaveBeenCalledWith(4, 5, 6)
  })
  test('debounce keeps context', () => {
    // Given
    jest.useFakeTimers()
    const callMe = jest.fn()
    function TestFn () {
      this.val = 'hello'
      this.fn = function (extVal) {
        callMe(this.val, extVal)
      }
      this.dbFn = utils.debounce(this.fn, 500, this)
    }
    const testFn = new TestFn()

    // When
    testFn.dbFn('there')
    jest.runAllTimers()

    // Then
    expect(callMe).toHaveBeenCalledTimes(1)
    expect(callMe).toHaveBeenCalledWith('hello', 'there')
  })
  test('getUrlInfo', () => {
    // When && Then
    expect(utils.getUrlInfo('http://anything.com')).toEqual({
      protocol: 'http:',
      host: 'anything.com',
      hostname: 'anything.com',
      port: undefined,
      pathname: '',
      search: '',
      hash: ''
    })
    expect(utils.getUrlInfo('https://anything.com')).toEqual({
      protocol: 'https:',
      host: 'anything.com',
      hostname: 'anything.com',
      port: undefined,
      pathname: '',
      search: '',
      hash: ''
    })
    expect(utils.getUrlInfo('http://anything.com:8080/index.html')).toEqual({
      protocol: 'http:',
      host: 'anything.com:8080',
      hostname: 'anything.com',
      port: '8080',
      pathname: '/index.html',
      search: '',
      hash: ''
    })
    expect(utils.getUrlInfo('guides.neo4j.com')).toEqual({
      protocol: undefined,
      host: 'guides.neo4j.com',
      hostname: 'guides.neo4j.com',
      port: undefined,
      pathname: '',
      search: '',
      hash: ''
    })
    expect(utils.getUrlInfo('localhost')).toEqual({
      protocol: undefined,
      host: 'localhost',
      hostname: 'localhost',
      port: undefined,
      pathname: '',
      search: '',
      hash: ''
    })
  })
  describe('hostIsAllowed', () => {
    test('should respect host whitelist', () => {
      // Given
      const whitelist = 'https://second.com,fourth.com'

      // When && Then
      expect(utils.hostIsAllowed('http://first.com', whitelist)).toEqual(false)
      expect(utils.hostIsAllowed('http://second.com', whitelist)).toEqual(false)
      expect(utils.hostIsAllowed('https://second.com', whitelist)).toEqual(true)
      expect(utils.hostIsAllowed('http://fourth.com', whitelist)).toEqual(true)
      expect(utils.hostIsAllowed('https://fourth.com', whitelist)).toEqual(true)
    })
    test('should pass everything when whitelist is *', () => {
      // Given
      const whitelist = '*'

      // When && Then
      expect(utils.hostIsAllowed('anything', whitelist)).toEqual(true)
    })
    test('should use defaults if no whitelist specified', () => {
      // When && Then
      expect(utils.hostIsAllowed('http://anything.com', null)).toEqual(false)
      expect(utils.hostIsAllowed('http://anything.com', '')).toEqual(false)
      expect(utils.hostIsAllowed('guides.neo4j.com', undefined)).toEqual(true)
      expect(utils.hostIsAllowed('guides.neo4j.com', null)).toEqual(true)
      expect(utils.hostIsAllowed('guides.neo4j.com', '')).toEqual(true)
      expect(utils.hostIsAllowed('localhost', null)).toEqual(true)
      expect(utils.hostIsAllowed('localhost', '')).toEqual(true)
    })
    test('can parse url params correctly', () => {
    // Given
      const urls = [
        {location: 'http://neo4j.com/?param=1', paramName: 'param', expect: ['1']},
        {location: 'http://neo4j.com/?param=1&param=2', paramName: 'param', expect: ['1', '2']},
        {location: 'http://neo4j.com/?param2=2&param=1', paramName: 'param', expect: ['1']},
        {location: 'http://neo4j.com/?param=', paramName: 'param', expect: undefined},
        {location: 'http://neo4j.com/', paramName: 'param', expect: undefined}
      ]

      // When & Then
      urls.forEach((tCase) => {
        const res = utils.getUrlParamValue(tCase.paramName, tCase.location)
        expect(res).toEqual(tCase.expect)
      })
    })
    test('can remove commented lines from a string', () => {
    // Given
      const stringWithComments = '//Hello is is a comment\nSome string'

      // When & Then
      expect(utils.removeComments(stringWithComments)).toEqual('Some string')
    })
  })
})
