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

/* global jest, describe, test, expect */
import * as utils from './utils'

describe('utils', () => {
  describe('serialExecution', () => {
    test('handles happy path', () => {
      const w1 = () => true // works with bool
      const s1 = jest.fn()
      const e1 = jest.fn()

      const w2 = () => Promise.resolve(true) // and promises
      const s2 = jest.fn()
      const e2 = jest.fn()

      const w3 = () => true
      const s3 = jest.fn()
      const e3 = jest.fn()

      utils.serialExecution(
        utils.serialExecution(
          utils.serialExecution(Promise.resolve(), w1, s1, e1),
          w2,
          s2,
          e2
        ),
        w3,
        s3,
        e3
      )

      return flushPromises().then(() => {
        expect(s1).toHaveBeenCalledTimes(1)
        expect(s2).toHaveBeenCalledTimes(1)
        expect(s3).toHaveBeenCalledTimes(1)

        expect(e1).toHaveBeenCalledTimes(0)
        expect(e2).toHaveBeenCalledTimes(0)
        expect(e3).toHaveBeenCalledTimes(0)
        return Promise.resolve() // Resolve not to break test
      })
    })

    test('breaks on first error', () => {
      const w1 = () => true
      const s1 = jest.fn()
      const e1 = jest.fn()
      const skip1 = jest.fn()

      const w2 = () => Promise.reject(Error('nope'))
      const s2 = jest.fn()
      const e2 = jest.fn()
      const skip2 = jest.fn()

      const w3 = () => true
      const s3 = jest.fn()
      const e3 = jest.fn()
      const skip3 = jest.fn()

      const res = utils.serialExecution(
        utils.serialExecution(
          utils.serialExecution(Promise.resolve(), w1, s1, e1, skip1),
          w2,
          s2,
          e2,
          skip2
        ),
        w3,
        s3,
        e3,
        skip3
      )
      res.catch(e => {}) // catch error from promise chain not to break test

      return flushPromises().then(() => {
        expect(s1).toHaveBeenCalledTimes(1)
        expect(e1).toHaveBeenCalledTimes(0)
        expect(skip1).toHaveBeenCalledTimes(0)

        expect(s2).toHaveBeenCalledTimes(0)
        expect(e2).toHaveBeenCalledTimes(1)
        expect(skip2).toHaveBeenCalledTimes(0)

        expect(s3).toHaveBeenCalledTimes(0)
        expect(e3).toHaveBeenCalledTimes(0)
        expect(skip3).toHaveBeenCalledTimes(1)
        return Promise.resolve() // Resolve not to break test
      })
    })
  })
  test('can deeply compare objects', () => {
    // Given
    const o1 = { a: 'a', b: 'b', c: { c: 'c' } }
    const o2 = { ...o1 }
    const o3 = { ...o1, c: { c: 'd' } }
    const o4 = { ...o1, d: { e: { f: 'g' } } }
    const o5 = { ...o1, d: { e: { f: 'g' } } }

    // When & Then
    expect(utils.deepEquals(o1, o2)).toBeTruthy()
    expect(utils.deepEquals(o1, o3)).toBeFalsy()
    expect(utils.deepEquals(o4, o5)).toBeTruthy()
  })
  test('can shallowEquals compare objects', () => {
    // Given
    const o1 = { a: 1, b: 2, c: 'hello' }
    const o2 = { ...o1 }
    const o3 = { ...o1, c: { c: 'd' } }
    const o4 = { ...o1, d: { e: { f: 'g' } } }
    const o5 = { ...o4, d: { e: { f: 'g' } } }

    // When & Then
    expect(utils.shallowEquals(o1, o2)).toBeTruthy()
    expect(utils.shallowEquals(o1, o3)).toBeFalsy()
    expect(utils.shallowEquals(o4, o5)).toBeFalsy()
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
    tests.forEach(t => {
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
  test('throttle limits the number of fn calls', () => {
    // Given
    jest.useFakeTimers()
    const fn = jest.fn()
    const fn2 = jest.fn()
    const thFn = utils.throttle(fn, 500)
    const thFn2 = utils.throttle(fn2, 500)

    // When
    thFn(4, 5, 6)
    thFn(1, 2, 3)
    jest.runAllTimers()
    thFn2(1, 2, 3)
    jest.runAllTimers()
    thFn2(4, 5, 6)
    jest.runAllTimers()

    // Then
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(4, 5, 6)
    expect(fn2).toHaveBeenCalledTimes(2)
    expect(fn2).toHaveBeenCalledWith(1, 2, 3)
    expect(fn2).toHaveBeenCalledWith(4, 5, 6)
  })
  test('throttle keeps context', () => {
    // Given
    jest.useFakeTimers()
    const callMe = jest.fn()
    function TestFn () {
      this.val = 'hello'
      this.fn = function (extVal) {
        callMe(this.val, extVal)
      }
      this.thFn = utils.throttle(this.fn, 500, this)
    }
    const testFn = new TestFn()

    // When
    testFn.thFn('there')
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
      port: '',
      pathname: '',
      search: '',
      hash: '',
      username: '',
      password: ''
    })
    expect(utils.getUrlInfo('https://anything.com')).toEqual({
      protocol: 'https:',
      host: 'anything.com',
      hostname: 'anything.com',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      username: '',
      password: ''
    })
    expect(utils.getUrlInfo('http://anything.com:8080/index.html')).toEqual({
      protocol: 'http:',
      host: 'anything.com:8080',
      hostname: 'anything.com',
      port: '8080',
      pathname: '/index.html',
      search: '',
      hash: '',
      username: '',
      password: ''
    })
    expect(utils.getUrlInfo('guides.neo4j.com')).toEqual({
      protocol: '',
      host: 'guides.neo4j.com',
      hostname: 'guides.neo4j.com',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      username: '',
      password: ''
    })
    expect(utils.getUrlInfo('http://localhost')).toEqual({
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      username: '',
      password: ''
    })
    expect(
      utils.getUrlInfo(
        'http://neo:neoPass@guides.neo4j.com:1111/path?arg1=a&arg2=2'
      )
    ).toEqual({
      protocol: 'http:',
      host: 'guides.neo4j.com:1111',
      hostname: 'guides.neo4j.com',
      port: '1111',
      pathname: '/path',
      search: '?arg1=a&arg2=2',
      hash: '',
      username: 'neo',
      password: 'neoPass'
    })
  })
  describe('extractWhitelistFromConfigString', () => {
    test('extracts comma separated string of hosts to array', () => {
      // Given
      const input = 'localhost,guides.neo4j.com'

      // When
      const res = utils.extractWhitelistFromConfigString(input)

      // Then
      expect(res).toEqual(['localhost', 'guides.neo4j.com'])
    })
    test('trims each host value and removes trailing slash', () => {
      // Given
      const input = 'localhost , guides.neo4j.com/ , neo4j.com'

      // When
      const res = utils.extractWhitelistFromConfigString(input)

      // Then
      expect(res).toEqual(['localhost', 'guides.neo4j.com', 'neo4j.com'])
    })
  })
  describe('addProtocolsToUrlList', () => {
    test('Add protocol where needed', () => {
      // Given
      const input = [
        'http://test.com',
        'oskarhane.com',
        '*',
        null,
        'https://mysite.com/guides'
      ]

      // When
      const res = utils.addProtocolsToUrlList(input)

      // Then
      expect(res).toEqual([
        'http://test.com',
        'https://oskarhane.com',
        'http://oskarhane.com',
        'https://mysite.com/guides'
      ])
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
    test('can parse url params correctly', () => {
      // Given
      const urls = [
        {
          location: 'http://neo4j.com/?param=1',
          paramName: 'param',
          expect: ['1']
        },
        {
          location: 'http://neo4j.com/?param=1&param=2',
          paramName: 'param',
          expect: ['1', '2']
        },
        {
          location: 'http://neo4j.com/?param2=2&param=1',
          paramName: 'param',
          expect: ['1']
        },
        {
          location: 'http://neo4j.com/?param=',
          paramName: 'param',
          expect: undefined
        },
        { location: 'http://neo4j.com/', paramName: 'param', expect: undefined }
      ]

      // When & Then
      urls.forEach(tCase => {
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
  test('stringifyMod works just as JSON.stringify with no modFn', () => {
    // Given
    const tests = [
      { x: 1, y: ['yy', true, undefined, null] },
      null,
      false,
      [[], [0]],
      4
    ]

    // When & Then
    tests.forEach(t => {
      expect(utils.stringifyMod(t)).toEqual(JSON.stringify(t))
    })
  })

  test('stringifyMod works just as JSON.stringify with modFn', () => {
    // Given
    const modFn = val => {
      if (Number.isInteger(val)) return val.toString()
    }
    const tests = [null, false, [[], [0]], '4', 4, ['string']]
    const expects = [
      'null',
      'false',
      JSON.stringify([[], [0]]),
      '"4"',
      '4',
      '["string"]'
    ]

    // When & Then
    tests.forEach((t, index) => {
      expect(utils.stringifyMod(t, modFn)).toEqual(expects[index])
    })
  })
  test('stringifyMod can add spaces on the output', () => {
    // Given
    const tests = [
      false,
      [[], [0]],
      {
        prop1: 1,
        prop2: [
          {
            innerProp: 'innerVal',
            innerProp2: [
              { innerInner: 'innerVal2', innerInner2: 'innerInnerVal2' }
            ]
          }
        ]
      },
      ['string']
    ]
    const expects = [
      'false',
      JSON.stringify([[], [0]], null, 2),
      JSON.stringify(
        {
          prop1: 1,
          prop2: [
            {
              innerProp: 'innerVal',
              innerProp2: [
                { innerInner: 'innerVal2', innerInner2: 'innerInnerVal2' }
              ]
            }
          ]
        },
        null,
        2
      ),
      JSON.stringify(['string'], null, 2)
    ]

    // When & Then
    tests.forEach((t, index) => {
      expect(utils.stringifyMod(t, null, true)).toEqual(expects[index])
    })
  })
  test('parseTimeMillis correctly parses human readable units correctly', () => {
    // Given
    const times = [
      { test: '100', expect: 100 * 1000 },
      { test: 100, expect: 100 * 1000 },
      { test: '100ms', expect: 100 },
      { test: '100s', expect: 100 * 1000 },
      { test: '100m', expect: 100 * 60 * 1000 },
      { test: '100x', expect: 0 },
      { test: 'x', expect: 0 }
    ]

    // When & Then
    times.forEach(time => {
      expect(utils.parseTimeMillis(time.test)).toEqual(time.expect)
    })
  })
  describe('ecsapeCypherMetaItem', () => {
    // Given
    const items = [
      { test: 'Label', expect: 'Label' },
      { test: 'Label Space', expect: '`Label Space`' },
      { test: 'Label1', expect: 'Label1' },
      { test: 'Label-dash', expect: '`Label-dash`' },
      { test: 'Label`Backtick', expect: '`Label``Backtick`' }
    ]

    // When && Then
    items.forEach(item => {
      expect(utils.ecsapeCypherMetaItem(item.test)).toEqual(item.expect)
    })
  })
})
describe('Object props manipulation', () => {
  const start1 = { x: 1, z: { zz: 1 } }
  const start2 = { x: 1 }
  const start3 = { x: 1, '\\x': 2, '\\\\x': 3 }
  const res1 = { x: 1, y: 2, z: { zz: 1 } }
  const res2 = { '\\x': 1, x: 2 }
  const res3 = { x: 4, '\\x': 1, '\\\\x': 2, '\\\\\\x': 3 }
  test('safetlyAddObjectProp adds prop if no collision', () => {
    const orig = { ...start1 }
    const res = utils.safetlyAddObjectProp(orig, 'y', 2)
    expect(res).toEqual({ ...res1 })
  })
  test('safetlyAddObjectProp escapes existing props if collision', () => {
    const orig = { ...start2 }
    const res = utils.safetlyAddObjectProp(orig, 'x', 2)
    expect(res).toEqual({ ...res2 })
  })
  test('safetlyAddObjectProp escapes existing props if collision chain', () => {
    const orig = { ...start3 }
    const res = utils.safetlyAddObjectProp(orig, 'x', 4)
    expect(res).toEqual({ ...res3 })
  })
  test('safetlyRemoveObjectProp removes when no escapes', () => {
    const orig = { ...res1 }
    const res = utils.safetlyRemoveObjectProp(orig, 'y')
    expect(res).toEqual({ ...start1 })
  })
  test('safetlyRemoveObjectProp removes when one escape', () => {
    const orig = { ...res2 }
    const res = utils.safetlyRemoveObjectProp(orig, 'x')
    expect(res).toEqual({ ...start2 })
  })
  test('safetlyRemoveObjectProp removes when chained escapes', () => {
    const orig = { ...res3 }
    const res = utils.safetlyRemoveObjectProp(orig, 'x')
    expect(res).toEqual({ ...start3 })
  })
  describe('escaping reserved props', () => {
    const start1 = { x: 1, z: { zz: 1 } }
    const start2 = { x: 1, '\\x': 2, '\\\\x': 3 }
    const res1 = { x: 1, z: { zz: 1 } }
    const res2 = { '\\x': 1, '\\\\x': 2, '\\\\\\x': 3 }
    test('escapeReservedProps does nothing if no reserved props used', () => {
      const orig = { ...start1 }
      const res = utils.escapeReservedProps(orig, 'y')
      expect(res).toEqual({ ...res1 })
    })
    test('escapeReservedProps does nothing if reserved prop used', () => {
      const orig = { ...start2 }
      const res = utils.escapeReservedProps(orig, 'x')
      expect(res).toEqual({ ...res2 })
    })
    test('unEscapeReservedProps does nothing if no reserved props used', () => {
      const orig = { ...res1 }
      const res = utils.unEscapeReservedProps(orig, 'y')
      expect(res).toEqual({ ...start1 })
    })
    test('unEscapeReservedProps does nothing if reserved prop used', () => {
      const orig = { ...res2 }
      const res = utils.unEscapeReservedProps(orig, 'x')
      expect(res).toEqual({ ...start2 })
    })
  })
  test('arrayToObject', () => {
    expect(utils.arrayToObject([{ foo: 'bar' }])).toEqual({ foo: 'bar' })
  })
  describe('optionalToString', () => {
    test('will strings', () => {
      expect(utils.optionalToString(null)).toBe(null)
      expect(utils.optionalToString(1)).toBe('1')
      expect(utils.optionalToString({ a: 'a' })).toBe('[object Object]')
      expect(utils.optionalToString({ toString: () => 'a' })).toBe('a')
    })
  })
})
describe('toKeyString', () => {
  it('can encode strings with special characters', () => {
    // Given
    const strs = [
      { str: 'hey ho ', expect: 'aGV5JTIwaG8lMjAlRUYlQTMlQkY=' },
      {
        str: '✓ à la mode',
        expect: 'JUUyJTlDJTkzJTIwJUMzJUEwJTIwbGElMjBtb2Rl'
      },
      { str: '😍', expect: 'JUYwJTlGJTk4JThE' }
    ]

    // When & Then
    strs.forEach(str => {
      expect(utils.toKeyString(str.str)).toEqual(str.expect)
    })
  })
})

function flushPromises () {
  return new Promise(resolve => setImmediate(resolve))
}