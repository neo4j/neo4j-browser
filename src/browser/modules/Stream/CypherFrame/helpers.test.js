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

/* eslint-disable new-cap */
import neo4j from 'neo4j-driver'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import {
  resultHasNodes,
  resultHasRows,
  resultHasWarnings,
  resultHasPlan,
  resultIsError,
  getRecordsToDisplayInTable,
  initialView,
  extractRecordsToResultArray,
  flattenGraphItemsInResultArray,
  stringifyResultArray,
  recordToJSONMapper
} from './helpers'
import { stringModifier, csvFormat } from 'services/bolt/cypherTypesFormatting'

describe('helpers', () => {
  test('getRecordsToDisplayInTable should report if there are rows or not in the result', () => {
    // Given
    const maxRows = 2
    const items = [
      { request: { result: null }, expect: 0 },
      { request: { result: { records: [] } }, expect: 0 },
      { request: { result: { records: [1, 2] } }, expect: 2 },
      { request: { result: { records: [1, 2, 3] } }, expect: 2 }
    ]
    // When
    // Then
    items.forEach(item => {
      expect(
        getRecordsToDisplayInTable(item.request.result, maxRows).length
      ).toEqual(item.expect)
    })
  })
  test('resultHasRows should report if there are rows or not in the result', () => {
    // Given
    const items = [
      { request: null, expect: false },
      { request: { result: null }, expect: false },
      { request: { result: { records: [] } }, expect: false },
      { request: { result: { records: true } }, expect: false },
      { request: { result: { records: [1, 2] } }, expect: true },
      { request: { result: { records: ['string'] } }, expect: true }
    ]
    // When
    // Then
    items.forEach(item => {
      expect(resultHasRows(item.request)).toEqual(item.expect)
    })
  })
  test('resultHasWarnings should report if there are warnings or not in the result', () => {
    // Given
    const items = [
      { request: null, expect: false },
      { request: { result: null }, expect: false },
      { request: { result: true }, expect: false },
      { request: { result: { summary: true } }, expect: false },
      { request: { result: { summary: {} } }, expect: false },
      {
        request: { result: { summary: { notifications: null } } },
        expect: false
      },
      {
        request: { result: { summary: { notifications: true } } },
        expect: false
      },
      {
        request: { result: { summary: { notifications: [] } } },
        expect: false
      },
      {
        request: { result: { summary: { notifications: ['yes!'] } } },
        expect: true
      }
    ]
    // When
    // Then
    items.forEach(item => {
      expect(resultHasWarnings(item.request)).toEqual(item.expect)
    })
  })
  test('resultHasPlan should report if there are a plan or not in the result', () => {
    // Given
    const items = [
      { request: null, expect: false },
      { request: { result: null }, expect: false },
      { request: { result: true }, expect: false },
      { request: { result: { summary: true } }, expect: false },
      { request: { result: { summary: {} } }, expect: false },
      { request: { result: { summary: { plan: null } } }, expect: false },
      { request: { result: { summary: { profile: null } } }, expect: false },
      { request: { result: { summary: { plan: {} } } }, expect: true },
      { request: { result: { summary: { profile: {} } } }, expect: true }
    ]
    // When
    // Then
    items.forEach(item => {
      expect(resultHasPlan(item.request)).toEqual(item.expect)
    })
  })
  test('resultIsError should report if the result looks like an error', () => {
    // Given
    const items = [
      { request: null, expect: false },
      { request: { result: null }, expect: false },
      { request: { result: true }, expect: false },
      { request: { result: { code: 1 } }, expect: true }
    ]
    // When
    // Then
    items.forEach(item => {
      expect(resultIsError(item.request)).toEqual(item.expect)
    })
  })
  describe('resultHasNodes', () => {
    test('should return false if no request', () => {
      // Given
      const request = undefined

      // When
      const hasNodes = resultHasNodes(request)

      // Then
      expect(hasNodes).toEqual(false)
    })
    test('should return false if no result', () => {
      // Given
      const request = { result: undefined }

      // When
      const hasNodes = resultHasNodes(request)

      // Then
      expect(hasNodes).toEqual(false)
    })
    test('should return false if no nodes are found', () => {
      // Given
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'city'],
              get: mappedGet({ name: 'Oskar', city: 'Borås' })
            },
            {
              keys: ['name', 'city'],
              get: mappedGet({ name: 'Stella', city: 'Borås' })
            }
          ]
        }
      }

      // When
      const hasNodes = resultHasNodes(request, neo4j.types)

      // Then
      expect(hasNodes).toEqual(false)
    })
    test('should return true if nodes are found, even nested', () => {
      // Given
      const node = new neo4j.types.Node('2', ['Movie'], { prop2: 'prop2' })
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({
                name: 'Stella',
                maybeNode: { deeper: [1, node] }
              })
            }
          ]
        }
      }

      // When
      const hasNodes = resultHasNodes(request, neo4j.types)

      // Then
      expect(hasNodes).toEqual(true)
    })
  })
  describe('initialView', () => {
    test('should return error view if error', () => {
      // Given
      const props = {
        request: {
          status: 'error'
        }
      }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.ERRORS)
    })
    test('should return the forced view if existent', () => {
      // Given
      const props = {
        request: {
          status: 'success'
        },
        frame: {
          forceView: viewTypes.WARNINGS
        }
      }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.WARNINGS)
    })
    test('error overrides forced view', () => {
      // Given
      const props = {
        request: {
          status: 'error'
        },
        frame: {
          forceView: viewTypes.WARNINGS
        }
      }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.ERRORS)
    })
    test('should return the plan view if plan is existent', () => {
      // Given
      const props = {
        request: {
          result: {
            summary: {
              plan: {}
            }
          }
        }
      }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.PLAN)
    })
    test('should return the plan view if profile is existent', () => {
      // Given
      const props = {
        request: {
          result: {
            summary: {
              profile: {}
            }
          }
        }
      }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.PLAN)
    })
    test('should return the viz view if nodes are existent', () => {
      // Given
      const node = new neo4j.types.Node('2', ['Movie'], { prop2: 'prop2' })
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({
                name: 'Stella',
                maybeNode: { deeper: [1, node] }
              })
            }
          ]
        }
      }
      const props = { request }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.VISUALIZATION)
    })
    test('should return the table view if nodes are not existent', () => {
      // Given
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Stella', maybeNode: false })
            }
          ]
        }
      }
      const props = { request }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.TABLE)
    })
    test('should return the table view no rows', () => {
      // Given
      const request = {
        result: {
          records: []
        }
      }
      const props = { request }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.TABLE)
    })
    test('should return undefined for pending state', () => {
      // Given
      const request = {
        status: 'pending'
      }
      const props = { request }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(undefined)
    })
    test('should return the ascii if thats the last view', () => {
      // Given
      const node = new neo4j.types.Node('2', ['Movie'], { prop2: 'prop2' })
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({
                name: 'Stella',
                maybeNode: { deeper: [1, node] }
              })
            }
          ]
        }
      }
      const props = { request, recentView: viewTypes.TEXT }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.TEXT)
    })
    test('should return the table if viz the last view but no viz elements exists', () => {
      // Given
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Stella', maybeNode: false })
            }
          ]
        }
      }
      const props = { request, recentView: viewTypes.VISUALIZATION }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.TABLE)
    })
    test('should not change view if state.openView exists', () => {
      // Given
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Stella', maybeNode: false })
            }
          ]
        }
      }
      const props = { request, recentView: viewTypes.VISUALIZATION }
      const state = { openView: viewTypes.TEXT }

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.TEXT)
    })
    test('an error overrides openView', () => {
      // Given
      const request = {
        status: 'error'
      }
      const props = { request, recentView: viewTypes.VISUALIZATION }
      const state = { openView: viewTypes.TEXT }

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.ERRORS)
    })
    test('should return viz if the last view was plan but no plan exists and viz elements exists', () => {
      // Given
      const node = new neo4j.types.Node('2', ['Movie'], { prop2: 'prop2' })
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({
                name: 'Stella',
                maybeNode: { deeper: [1, node] }
              })
            }
          ]
        }
      }
      const props = { request, recentView: viewTypes.PLAN }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.VISUALIZATION)
    })
    test('should return table if the last view was plan but no plan exists and no viz elements exists', () => {
      // Given
      const mappedGet = map => key => map[key]
      const request = {
        result: {
          records: [
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Oskar', maybeNode: false })
            },
            {
              keys: ['name', 'maybeNode'],
              get: mappedGet({ name: 'Stella', maybeNode: { deeper: [1, 2] } })
            }
          ]
        }
      }
      const props = { request, recentView: viewTypes.PLAN }
      const state = {}

      // When
      const view = initialView(props, state)

      // Then
      expect(view).toEqual(viewTypes.TABLE)
    })
  })
  describe('record transformations', () => {
    test('extractRecordsToResultArray handles empty records', () => {
      // Given
      const records = null

      // When
      const res = extractRecordsToResultArray(records)

      // Then
      expect(res).toEqual([])
    })
    test('extractRecordsToResultArray handles regular records', () => {
      // Given
      const start = new neo4j.types.Node(1, ['X'], { x: 1 })
      const end = new neo4j.types.Node(2, ['Y'], { y: new neo4j.int(1) })
      const rel = new neo4j.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const segments = [new neo4j.types.PathSegment(start, rel, end)]
      const path = new neo4j.types.Path(start, end, segments)

      const records = [
        {
          keys: ['"x"', '"y"', '"n"'],
          _fields: [
            'x',
            'y',
            new neo4j.types.Node('1', ['Person'], { prop1: 'prop1' })
          ]
        },
        {
          keys: ['"x"', '"y"', '"n"'],
          _fields: ['xx', 'yy', path]
        }
      ]

      // When
      const res = extractRecordsToResultArray(records)

      // Then
      expect(res).toEqual([
        ['"x"', '"y"', '"n"'],
        ['x', 'y', new neo4j.types.Node('1', ['Person'], { prop1: 'prop1' })],
        ['xx', 'yy', path]
      ])
    })
    test('flattenGraphItemsInResultArray extracts props from graph items', () => {
      // Given
      const start = new neo4j.types.Node(1, ['X'], { x: 1 })
      const end = new neo4j.types.Node(2, ['Y'], { y: 1 })
      const rel = new neo4j.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const segments = [new neo4j.types.PathSegment(start, rel, end)]
      const path = new neo4j.types.Path(start, end, segments)

      const records = [
        {
          keys: ['"x"', '"y"', '"n"'],
          _fields: [
            'x',
            'y',
            new neo4j.types.Node('1', ['Person'], { prop1: 'prop1' })
          ]
        },
        {
          keys: ['"x"', '"y"', '"n"'],
          _fields: ['xx', 'yy', { prop: path }]
        }
      ]

      // When
      const step1 = extractRecordsToResultArray(records)
      const res = flattenGraphItemsInResultArray(
        neo4j.types,
        neo4j.isInt,
        step1
      )

      // Then
      expect(res).toEqual([
        ['"x"', '"y"', '"n"'],
        ['x', 'y', { prop1: 'prop1' }],
        ['xx', 'yy', { prop: [{ x: 1 }, { rel: 1 }, { y: 1 }] }]
      ])
    })
    test('stringifyResultArray uses stringifyMod to serialize', () => {
      // Given
      const records = [
        {
          keys: ['"neoInt"', '"int"', '"any"', '"backslash"'],
          _fields: [new neo4j.int('882573709873217509'), 100, 0.5, '"\\"']
        },
        {
          keys: ['"neoInt"', '"int"', '"any"'],
          _fields: [new neo4j.int(300), 100, 'string']
        }
      ]

      // When
      const step1 = extractRecordsToResultArray(records)
      const step2 = flattenGraphItemsInResultArray(
        neo4j.types,
        neo4j.isInt,
        step1
      )
      const res = stringifyResultArray(stringModifier, step2)
      // Then
      expect(res).toEqual([
        ['""neoInt""', '""int""', '""any""', '""backslash""'],
        ['882573709873217509', '100.0', '0.5', '""\\""'],
        ['300', '100.0', '"string"']
      ])
    })
    test('stringifyResultArray can take different formatter function (csvFormat)', () => {
      // Given
      const records = [
        {
          keys: ['"neoInt"', '"int"', '"any"', '"backslash"', '"bool"'],
          _fields: [
            new neo4j.int('882573709873217509'),
            100,
            0.5,
            '"\\"',
            false
          ]
        },
        {
          keys: ['"neoInt"', '"int"', '"any"', '"string with comma"'],
          _fields: [new neo4j.int(300), 100, 'string', 'my, string']
        }
      ]

      // When
      const step1 = extractRecordsToResultArray(records)
      const step2 = flattenGraphItemsInResultArray(
        neo4j.types,
        neo4j.isInt,
        step1
      )
      const res = stringifyResultArray(csvFormat, step2)
      // Then
      expect(res).toEqual([
        ['"neoInt"', '"int"', '"any"', '"backslash"', '"bool"'],
        ['882573709873217509', '100.0', '0.5', '"\\"', 'false'],
        ['300', '100.0', 'string', 'my, string']
      ])
    })
    test('stringifyResultArray handles neo4j integers nested within graph items', () => {
      // Given
      const start = new neo4j.types.Node(1, ['X'], { x: new neo4j.int(1) })
      const end = new neo4j.types.Node(2, ['Y'], { y: new neo4j.int(2) })
      const rel = new neo4j.types.Relationship(3, 1, 2, 'REL', {
        rel: new neo4j.int(1)
      })
      const segments = [new neo4j.types.PathSegment(start, rel, end)]
      const path = new neo4j.types.Path(start, end, segments)

      const records = [
        {
          keys: ['"x"', '"y"', '"n"'],
          _fields: [
            'x',
            'y',
            new neo4j.types.Node('1', ['Person'], { prop1: 'prop1' })
          ]
        },
        {
          keys: ['"x"', '"y"', '"n"'],
          _fields: ['xx', 'yy', { prop: path }]
        }
      ]

      // When
      const step1 = extractRecordsToResultArray(records)
      const step2 = flattenGraphItemsInResultArray(
        neo4j.types,
        neo4j.isInt,
        step1
      )
      const res = stringifyResultArray(stringModifier, step2)
      // Then
      expect(res).toEqual([
        ['""x""', '""y""', '""n""'],
        ['"x"', '"y"', JSON.stringify({ prop1: 'prop1' })],
        [
          '"xx"',
          '"yy"',
          JSON.stringify({ prop: [{ x: 1 }, { rel: 1 }, { y: 2 }] })
        ] // <--
      ])
    })
  })

  describe('recordToJSONMapper', () => {
    describe('Nodes', () => {
      test('handles integer values', () => {
        const node = new neo4j.types.Node(1, ['foo'], { bar: new neo4j.int(3) })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 3
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles string values', () => {
        const node = new neo4j.types.Node(1, ['foo'], { bar: 'baz' })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 'baz'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles date values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: '1970-01-01'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles time values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.Time(11, 1, 12, 0, 0)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: '11:01:12Z'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles local time values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.LocalTime(11, 1, 12, 0)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: '11:01:12'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles datetime values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.DateTime(1970, 1, 1, 11, 1, 12, 0, 0)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: '1970-01-01T11:01:12Z'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles local datetime values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.LocalDateTime(1970, 1, 1, 11, 1, 12, 0)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: '1970-01-01T11:01:12'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles point values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.Point(1, 10, 5, 15)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: { srid: 1, x: 10, y: 5, z: 15 }
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles duration values', () => {
        const node = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.types.Duration(10, 5, 1, 0)
        })
        const record = new neo4j.types.Record(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 'P10M5DT1S'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })

    describe('Relationships', () => {
      test('handles integer values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.int(3)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: 3
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles string values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: 'baz'
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: 'baz'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles date values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: '1970-01-01'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles time values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.Time(11, 1, 12, 0, 0)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: '11:01:12Z'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles local time values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.LocalTime(11, 1, 12, 0)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: '11:01:12'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles datetime values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.DateTime(1970, 1, 1, 11, 1, 12, 0, 0)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: '1970-01-01T11:01:12Z'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles local datetime values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.LocalDateTime(1970, 1, 1, 11, 1, 12, 0)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: '1970-01-01T11:01:12'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles point values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.Point(1, 10, 5, 15)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: { srid: 1, x: 10, y: 5, z: 15 }
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles duration values', () => {
        const relationship = new neo4j.types.Relationship(1, 2, 3, 'foo', {
          bar: new neo4j.types.Duration(10, 5, 1, 0)
        })
        const record = new neo4j.types.Record(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: 'P10M5DT1S'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })

    describe('Nodes and Relationships', () => {
      test('Node -> Relationship -> Node', () => {
        const node1 = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.int(3)
        })
        const relationship = new neo4j.types.Relationship(3, 1, 2, 'bom', {
          bar: 'apa'
        })
        const node2 = new neo4j.types.Node(2, ['bam'], {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const record = new neo4j.types.Record(
          ['n1', 'r1', 'n2'],
          [node1, relationship, node2]
        )
        const expected = {
          n1: {
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 3
            }
          },
          r1: {
            identity: 3,
            elementType: 'relationship',
            type: 'bom',
            start: 1,
            end: 2,
            properties: {
              bar: 'apa'
            }
          },
          n2: {
            identity: 2,
            elementType: 'node',
            labels: ['bam'],
            properties: {
              bar: '1970-01-01'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })

    describe('Paths', () => {
      test('MATCH p = (:Person)-[r]-(:Movie) RETURN p', () => {
        const node1 = new neo4j.types.Node(1, ['foo'], {
          bar: new neo4j.int(3)
        })
        const relationship = new neo4j.types.Relationship(3, 1, 2, 'bom', {
          bar: 'apa'
        })
        const node2 = new neo4j.types.Node(2, ['bam'], {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const path = new neo4j.types.Path(node1, node2, [
          new neo4j.types.PathSegment(node1, relationship, node2)
        ])
        const record = new neo4j.types.Record(['p'], [path])
        const expected = {
          p: {
            length: 1,
            start: {
              identity: 1,
              elementType: 'node',
              labels: ['foo'],
              properties: {
                bar: 3
              }
            },
            end: {
              identity: 2,
              elementType: 'node',
              labels: ['bam'],
              properties: {
                bar: '1970-01-01'
              }
            },
            segments: [
              {
                start: {
                  identity: 1,
                  elementType: 'node',
                  labels: ['foo'],
                  properties: {
                    bar: 3
                  }
                },
                relationship: {
                  identity: 3,
                  elementType: 'relationship',
                  type: 'bom',
                  start: 1,
                  end: 2,
                  properties: {
                    bar: 'apa'
                  }
                },
                end: {
                  identity: 2,
                  elementType: 'node',
                  labels: ['bam'],
                  properties: {
                    bar: '1970-01-01'
                  }
                }
              }
            ]
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })

    describe('Returns of raw data', () => {
      test('RETURN {...data} as foo', () => {
        const record = new neo4j.types.Record(
          ['foo'],
          [
            {
              data: [
                new neo4j.int(1),
                'car',
                new neo4j.types.Point(1, 10, 5, 15),
                new neo4j.types.Date(1970, 1, 1)
              ]
            }
          ]
        )
        const expected = {
          foo: {
            data: [1, 'car', { srid: 1, x: 10, y: 5, z: 15 }, '1970-01-01']
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })
  })
})
