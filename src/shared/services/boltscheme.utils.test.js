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

import * as utils from './boltscheme.utils'

describe('stripScheme', () => {
  const tests = [
    [null, ''],
    [undefined, ''],
    ['localhost:7687', 'localhost:7687'],
    ['https://localhost:7687', 'localhost:7687'],
    ['bolt+s://localhost:7687', 'localhost:7687'],
    ['bolt://localhost:7687', 'localhost:7687'],
    ['bolt://localhost:7687/bolt', 'localhost:7687/bolt'],
    [
      'https://localhost:7474?connectUrl=neo4j://localhost:7687',
      'localhost:7474?connectUrl=neo4j://localhost:7687'
    ],
    ['bolt://', '']
  ]

  test.each(tests)('strips the scheme correctly for %s', (input, expected) => {
    expect(utils.stripScheme(input)).toEqual(expected)
  })
})
describe('isSecureBoltScheme', () => {
  const tests = [
    [null, false],
    [undefined, false],
    ['localhost:7687', false],
    ['https://localhost:7687', false],
    ['bolt+s://localhost:7687', true],
    ['neo4j+s://localhost:7687', true],
    ['bolt://localhost:7687', false],
    ['bolt://localhost:7687/bolt', false],
    ['bolt://localhost:7474?connectUrl=neo4j+s://localhost:7687', false],
    ['bolt+ssc://localhost:7687/bolt', true],
    ['neo4j+ssc://localhost:7687/bolt', true]
  ]

  test.each(tests)(
    'grades the encryption correctly for scheme %s',
    (input, expected) => {
      expect(utils.isSecureBoltScheme(input)).toEqual(expected)
    }
  )
})
describe('getSchemeFlag', () => {
  const tests = [
    [null, ''],
    [undefined, ''],
    ['localhost:7687', ''],
    ['https://localhost:7687', ''],
    ['bolt+s://localhost:7687', '+s'],
    ['neo4j+s://localhost:7687', '+s'],
    ['bolt://localhost:7687', ''],
    ['bolt://localhost:7687/bolt', ''],
    ['bolt://localhost:7474?connectUrl=neo4j+s://localhost:7687', ''],
    ['bolt+ssc://localhost:7687/bolt', '+ssc'],
    ['neo4j+ssc://localhost:7687/bolt', '+ssc']
  ]

  test.each(tests)(
    'extracts the scheme flags correctly for %s',
    (input, expected) => {
      expect(utils.getSchemeFlag(input)).toEqual(expected)
    }
  )
})
describe('toggleSchemeRouting', () => {
  const tests = [
    [null, ''],
    [undefined, ''],
    ['localhost:7687', 'localhost:7687'],
    ['https://localhost:7687', 'https://localhost:7687'],
    ['bolt+s://localhost:7687', 'neo4j+s://localhost:7687'],
    ['neo4j+s://localhost:7687', 'bolt+s://localhost:7687'],
    ['bolt://localhost:7687', 'neo4j://localhost:7687'],
    ['bolt://localhost:7687/bolt', 'neo4j://localhost:7687/bolt'],
    [
      'bolt://bolt.com:7474?connectUrl=neo4j+s://localhost:7687',
      'neo4j://bolt.com:7474?connectUrl=neo4j+s://localhost:7687'
    ],
    ['bolt+ssc://localhost:7687/bolt', 'neo4j+ssc://localhost:7687/bolt'],
    ['neo4j+ssc://localhost:7687/bolt', 'bolt+ssc://localhost:7687/bolt']
  ]

  test.each(tests)(
    'toggles routing scheme correctly for %s',
    (input, expected) => {
      expect(utils.toggleSchemeRouting(input)).toEqual(expected)
    }
  )
})
describe('generateBoltUrl', () => {
  const tests = [
    // wrong types
    [null, undefined, undefined, 'neo4j://'],
    [undefined, undefined, undefined, 'neo4j://'],
    ['', undefined, undefined, 'neo4j://'],
    [true, undefined, undefined, 'neo4j://'],
    // empty input, but fallback
    ['', ['bolt'], 'bolt', 'bolt://'],
    // loose values
    ['localhost:7687', undefined, undefined, 'neo4j://localhost:7687'],
    ['https://localhost:7687', undefined, undefined, 'https://localhost:7687'],
    // Only allow certain schemas. No fallback.
    [
      'https://localhost:7687',
      ['bolt', 'neo4j'],
      undefined,
      'bolt://localhost:7687'
    ],
    [
      'bolt+s://localhost:7687',
      ['neo4j+s', 'bolt+s'],
      undefined,
      'bolt+s://localhost:7687'
    ],
    [
      'neo4j+s://localhost:7687',
      ['neo4j+s', 'bolt+s'],
      undefined,
      'neo4j+s://localhost:7687'
    ],
    // Flip encryption flag
    [
      'neo4j+s://localhost:7687',
      ['neo4j', 'bolt'],
      undefined,
      'neo4j://localhost:7687'
    ],
    [
      'bolt+s://localhost:7687',
      ['neo4j', 'bolt'],
      undefined,
      'bolt://localhost:7687'
    ],
    [
      'neo4j://localhost:7687',
      ['neo4j+s', 'bolt+s'],
      undefined,
      'neo4j+s://localhost:7687'
    ],
    [
      'bolt://localhost:7687',
      ['neo4j+s', 'bolt+s'],
      undefined,
      'bolt+s://localhost:7687'
    ],
    // Fallback schema
    [
      'localhost:7687',
      ['neo4j+s', 'bolt+s'],
      'bolt+s',
      'bolt+s://localhost:7687'
    ],
    [
      'localhost:7687',
      ['neo4j+s', 'bolt+s'],
      'bolt',
      'neo4j+s://localhost:7687'
    ],
    // encryption flip before fallback
    [
      'neo4j://localhost:7687',
      ['neo4j+s', 'bolt+s'],
      'bolt+s',
      'neo4j+s://localhost:7687'
    ],
    // bolt+routing -> neo4j://
    [
      'bolt+routing://localhost:7687',
      ['neo4j+s', 'bolt+s'],
      'bolt+s',
      'neo4j+s://localhost:7687'
    ],
    [
      'bolt+routing://localhost:7687',
      ['neo4j', 'bolt'],
      'bolt',
      'neo4j://localhost:7687'
    ]
  ]

  test.each(tests)(
    'generates a bolt host correctly for %s',
    (input, allowedSchemes, fallbackScheme, expected) => {
      expect(
        utils.generateBoltUrl(allowedSchemes, input, fallbackScheme)
      ).toEqual(expected)
    }
  )
})
