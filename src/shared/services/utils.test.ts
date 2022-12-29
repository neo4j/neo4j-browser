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
import * as utils from './utils'
import { CLOUD, DESKTOP, WEB } from 'shared/modules/app/appDuck'

describe('utils', () => {
  describe('serialExecution', () => {
    test('rejects if no args', () => {
      return expect(utils.serialExecution()).rejects.toMatchObject(
        Error('Nothing to do')
      )
    })
    test('rejects if no work', () => {
      return expect(
        utils.serialExecution({
          something: true
        })
      ).rejects.toMatchObject(Error('Nothing to do'))
    })
    test('handles happy path', () => {
      const w1 = {
        workFn: () => true, // works with bool
        onStart: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn()
      }
      const w2 = {
        workFn: () => Promise.resolve(true), // and promises
        onStart: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn()
      }
      const w3 = {
        workFn: () => true,
        onStart: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn()
      }

      utils.serialExecution(w1, w2, w3)

      return utils.flushPromises().then(() => {
        expect(w1.onStart).toHaveBeenCalledTimes(1)
        expect(w2.onStart).toHaveBeenCalledTimes(1)
        expect(w3.onStart).toHaveBeenCalledTimes(1)

        expect(w1.onSuccess).toHaveBeenCalledTimes(1)
        expect(w2.onSuccess).toHaveBeenCalledTimes(1)
        expect(w3.onSuccess).toHaveBeenCalledTimes(1)

        expect(w1.onError).toHaveBeenCalledTimes(0)
        expect(w2.onError).toHaveBeenCalledTimes(0)
        expect(w3.onError).toHaveBeenCalledTimes(0)
        return Promise.resolve() // Resolve not to break test
      })
    })

    test('breaks on first error', () => {
      const w1 = {
        workFn: () => true, // works with bool
        onStart: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn(),
        onSkip: jest.fn()
      }
      const w2 = {
        workFn: () => Promise.reject(Error('fail')), // and promises
        onStart: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn(),
        onSkip: jest.fn()
      }
      const w3 = {
        workFn: () => true,
        onStart: jest.fn(),
        onSuccess: jest.fn(),
        onError: jest.fn(),
        onSkip: jest.fn()
      }

      const res = utils.serialExecution(w1, w2, w3)
      res.catch(() => {}) // catch error from promise chain not to break test

      return utils.flushPromises().then(() => {
        expect(w1.onStart).toHaveBeenCalledTimes(1)
        expect(w1.onSuccess).toHaveBeenCalledTimes(1)
        expect(w1.onError).toHaveBeenCalledTimes(0)
        expect(w1.onSkip).toHaveBeenCalledTimes(0)

        expect(w2.onStart).toHaveBeenCalledTimes(1)
        expect(w2.onSuccess).toHaveBeenCalledTimes(0)
        expect(w2.onError).toHaveBeenCalledTimes(1)
        expect(w2.onSkip).toHaveBeenCalledTimes(0)

        expect(w3.onStart).toHaveBeenCalledTimes(0)
        expect(w3.onSuccess).toHaveBeenCalledTimes(0)
        expect(w3.onError).toHaveBeenCalledTimes(0)
        expect(w3.onSkip).toHaveBeenCalledTimes(1)
        return Promise.resolve() // Resolve not to break test
      })
    })
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
      { test: [1, 2, 3], from: -1, to: 1, expect: [1, 2, 3] },
      { test: [1, 2, 3], from: 0, to: 3, expect: [1, 2, 3] },
      { test: [1, 2, 3], from: 5, to: 1, expect: [1, 2, 3] },
      { test: 'string', from: 0, to: 3, expect: [] },
      { test: [1, 2, 3], from: 0, to: 1, expect: [2, 1, 3] },
      { test: [1, 2, 3], from: 2, to: 1, expect: [1, 3, 2] },
      { test: [1, 2, 3], from: 2, to: 0, expect: [3, 1, 2] }
    ]

    // When && Then
    tests.forEach(t => {
      expect(utils.moveInArray(t.from, t.to, t.test)).toEqual(t.expect)
    })
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
    function TestFn() {
      // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      this.val = 'hello'
      // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      this.fn = function (extVal: any) {
        callMe(this.val, extVal)
      }
      // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      this.thFn = utils.throttle(this.fn, 500, this)
    }
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    const testFn = new TestFn()

    // When
    testFn.thFn('there')
    jest.runAllTimers()

    // Then
    expect(callMe).toHaveBeenCalledTimes(1)
    expect(callMe).toHaveBeenCalledWith('hello', 'there')
  })
  test('parseURLWithDefaultProtocol', () => {
    // When && Then
    expect(utils.parseURLWithDefaultProtocol('anything.com')).toEqual(
      new URL('http://anything.com')
    )
    expect(utils.parseURLWithDefaultProtocol('guides.neo4j.com')).toEqual(
      new URL('http://guides.neo4j.com')
    )
    expect(
      utils.parseURLWithDefaultProtocol('https://guides.neo4j.com')
    ).toEqual(new URL('https://guides.neo4j.com'))
    expect(utils.parseURLWithDefaultProtocol('')).toEqual(null)
  })
  describe('extractAllowlistFromConfigString', () => {
    test('extracts comma separated string of hosts to array', () => {
      // Given
      const input = 'localhost,guides.neo4j.com'

      // When
      const res = utils.extractAllowlistFromConfigString(input)

      // Then
      expect(res).toEqual(['localhost', 'guides.neo4j.com'])
    })
    test('trims each host value and removes trailing slash', () => {
      // Given
      const input = 'localhost , guides.neo4j.com/ , neo4j.com'

      // When
      const res = utils.extractAllowlistFromConfigString(input)

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
  describe('resolveAllowlistWildcard', () => {
    test('Resolves * to given urls', () => {
      // Given
      const input = ['*']
      const resolveTo = ['guides.neo4j.com', 'localhost']

      // When
      const res = utils.resolveAllowlistWildcard(input, resolveTo)

      // Then
      expect(res).toEqual(['guides.neo4j.com', 'localhost'])
    })
    test('Resolves * to given urls when in a list', () => {
      // Given
      const input = [
        'http://test.com',
        'oskarhane.com',
        '*',
        null,
        'https://mysite.com/guides'
      ]
      const resolveTo = ['guides.neo4j.com', 'localhost']

      // When
      const res = utils.resolveAllowlistWildcard(input, resolveTo)

      // Then
      expect(res).toEqual([
        'http://test.com',
        'oskarhane.com',
        'guides.neo4j.com',
        'localhost',
        null,
        'https://mysite.com/guides'
      ])
    })
  })
  describe('hostIsAllowed', () => {
    test('should respect host allowlist', () => {
      // Given
      const allowlist = 'https://second.com,fourth.com'

      // When && Then
      expect(utils.hostIsAllowed('http://first.com', allowlist)).toEqual(false)
      expect(utils.hostIsAllowed('http://second.com', allowlist)).toEqual(false)
      expect(utils.hostIsAllowed('https://second.com', allowlist)).toEqual(true)
      expect(utils.hostIsAllowed('http://fourth.com', allowlist)).toEqual(true)
      expect(utils.hostIsAllowed('https://fourth.com', allowlist)).toEqual(true)
    })
    test('should pass everything when allowlist is *', () => {
      // Given
      const allowlist = '*'

      // When && Then
      expect(utils.hostIsAllowed('anything', allowlist)).toEqual(true)
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
    const modFn = (val: any) => {
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
      { test: '6000ns', expect: 0 },
      { test: '600000ns', expect: 1 },
      { test: '600000μs', expect: 600 },
      { test: '600μs', expect: 1 },
      { test: '1h', expect: 3600000 },
      { test: '1d', expect: 86400000 },
      { test: '100x', expect: 0 },
      { test: 'x', expect: 0 }
    ]

    // When & Then
    times.forEach(time => {
      expect(utils.parseTimeMillis(time.test)).toEqual(time.expect)
    })
  })
  describe('escapeCypherIdentifier', () => {
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
      expect(utils.escapeCypherIdentifier(item.test)).toEqual(item.expect)
    })
  })
  describe('unescapeCypherIdentifier', () => {
    // Given
    const items = [
      { test: 'Label', expect: 'Label' },
      { test: '`Label Space`', expect: 'Label Space' },
      { test: '`Label-dash`', expect: 'Label-dash' },
      { test: '`Label``Backtick`', expect: 'Label`Backtick' }
    ]

    // When && Then
    items.forEach(item => {
      expect(utils.unescapeCypherIdentifier(item.test)).toEqual(item.expect)
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
  test('safelyAddObjectProp adds prop if no collision', () => {
    const orig = { ...start1 }
    const res = utils.safelyAddObjectProp(orig, 'y', 2)
    expect(res).toEqual({ ...res1 })
  })
  test('safelyAddObjectProp escapes existing props if collision', () => {
    const orig = { ...start2 }
    const res = utils.safelyAddObjectProp(orig, 'x', 2)
    expect(res).toEqual({ ...res2 })
  })
  test('safelyAddObjectProp escapes existing props if collision chain', () => {
    const orig = { ...start3 }
    const res = utils.safelyAddObjectProp(orig, 'x', 4)
    expect(res).toEqual({ ...res3 })
  })
  test('safelyRemoveObjectProp removes when no escapes', () => {
    const orig = { ...res1 }
    const res = utils.safelyRemoveObjectProp(orig, 'y')
    expect(res).toEqual({ ...start1 })
  })
  test('safelyRemoveObjectProp removes when one escape', () => {
    const orig = { ...res2 }
    const res = utils.safelyRemoveObjectProp(orig, 'x')
    expect(res).toEqual({ ...start2 })
  })
  test('safelyRemoveObjectProp removes when chained escapes', () => {
    const orig = { ...res3 }
    const res = utils.safelyRemoveObjectProp(orig, 'x')
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

describe('isCloudHost', () => {
  it('detects cloud hosts properly', () => {
    expect(utils.isCloudHost('neo4j+s://foo.neo4j.io', ['neo4j.io'])).toBe(true)
  })

  it('detects cloud hosts properly when they specify a port', () => {
    expect(utils.isCloudHost('neo4j+s://foo.neo4j.io:7687', ['neo4j.io'])).toBe(
      true
    )
  })

  it('detects cloud hosts properly even with query arguments', () => {
    expect(
      utils.isCloudHost('neo4j+s://foo.neo4j.io?foo=true', ['neo4j.io'])
    ).toBe(true)
  })

  it('does not detect cloud hosts for localhost', () => {
    expect(utils.isCloudHost('neo4j+s://localhost', ['neo4j.io'])).toBe(false)
  })

  it('does not detect cloud hosts for hosts that start but not end with the cloud domain', () => {
    expect(utils.isCloudHost('neo4j+s://neo4j.io.foo', ['neo4j.io'])).toBe(
      false
    )
  })
})

describe('detectRuntimeEnv', () => {
  const tests: [any, any, any][] = [
    [
      'Injected Desktop API',
      [
        {
          neo4jDesktopApi: { exists: true },
          location: { href: 'https://mydomain.com:7474' }
        },
        []
      ],
      DESKTOP
    ],
    [
      'URL params Desktop API',
      [
        {
          location: {
            href: `https://mydomain.com:7474?neo4jDesktopApiUrl=${encodeURIComponent(
              'https://graphql.api.local:3001'
            )}&neo4jDesktopGraphAppClientId=xxx`
          }
        },
        []
      ],
      DESKTOP
    ],
    [
      'Cloud root domain',
      [{ location: { href: 'https://cloud.com:7474' } }, ['cloud.com']],
      CLOUD
    ],
    [
      'Cloud sub domain',
      [
        { location: { href: 'https://xyxy.zyzy.cloud.com:7474/path' } },
        ['cloud.com']
      ],
      CLOUD
    ],
    [
      'No cloud match',
      [{ location: { href: 'https://otherdomain.com:7474' } }, ['cloud.com']],
      WEB
    ],
    ['No input', [undefined], WEB]
  ]

  test.each(tests)(
    'Detects correct environment for test named %s',
    (_name, input: any[], output) => {
      expect(utils.detectRuntimeEnv(...input)).toEqual(output)
    }
  )
})
