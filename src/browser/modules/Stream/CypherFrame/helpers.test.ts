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
import neo4j, { Record } from 'neo4j-driver'

import {
  recordToStringArray,
  getRecordsToDisplayInTable,
  initialView,
  recordToJSONMapper,
  resultHasNodes,
  resultHasPlan,
  resultHasRows,
  resultHasWarnings,
  resultIsError
} from './helpers'
import * as viewTypes from 'shared/modules/frames/frameViewTypes'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'

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
        getRecordsToDisplayInTable(
          item.request.result as BrowserRequestResult,
          maxRows
        ).length
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
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const node = new (neo4j.types.Node as any)('2', ['Movie'], {
        prop2: 'prop2'
      })
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const node = new (neo4j.types.Node as any)('2', ['Movie'], {
        prop2: 'prop2'
      })
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const node = new (neo4j.types.Node as any)('2', ['Movie'], {
        prop2: 'prop2'
      })
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const node = new (neo4j.types.Node as any)('2', ['Movie'], {
        prop2: 'prop2'
      })
      const mappedGet = (map: any) => (key: any) => map[key]
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
      const mappedGet = (map: any) => (key: any) => map[key]
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
    test('recordToStringArray handles empty records', () => {
      // Given
      const records: Record[] = []

      // When
      const res = records.map(record => recordToStringArray(record))

      // Then
      expect(res).toEqual([])
    })
    test('recordToStringArray handles record with empty object and array', () => {
      const records = [new Record(['"x"', '"y"', '[]', '{}'], [[], {}, [], {}])]
      const res = records.map(record => recordToStringArray(record))
      expect(res).toEqual([['[]', '{}', '[]', '{}']])
    })

    test('recordToStringArray handles regular records', () => {
      // Given
      const start = new (neo4j.types.Node as any)(1, ['X'], { x: 1 })
      const end = new (neo4j.types.Node as any)(2, ['Y'], {
        y: new (neo4j.int as any)(1)
      })
      const rel = new (neo4j.types.Relationship as any)(3, 1, 2, 'REL', {
        rel: 1
      })
      const segments = [new (neo4j.types.PathSegment as any)(start, rel, end)]
      const path = new (neo4j.types.Path as any)(start, end, segments)

      const records = [
        new Record(
          ['"x"', '"y"', '"n"'],
          [
            'x',
            'y',
            new (neo4j.types.Node as any)('1', ['Person'], { prop1: 'prop1' })
          ]
        ) as any,
        new Record(['"x"', '"y"', '"n"'], ['xx', 'yy', path]) as any
      ]
      // When
      const res = records.map(record => recordToStringArray(record))

      // Then
      expect(res).toEqual([
        ['"x"', '"y"', '(:Person {prop1: "prop1"})'],
        ['"xx"', '"yy"', '(:X {x: 1.0})-[:REL {rel: 1.0}]->(:Y {y: 1})']
      ])
    })

    test('recordToStringArray handles two way path', () => {
      // Given
      const start = new (neo4j.types.Node as any)(1, ['X'], { x: 1 })
      const middle = new (neo4j.types.Node as any)(2, ['Y'], {
        y: new (neo4j.int as any)(1)
      })
      const end = new (neo4j.types.Node as any)(3, ['Z'], { z: '1' })
      const rel1 = new (neo4j.types.Relationship as any)(4, 1, 2, 'REL', {
        rel: 1
      })
      const rel2 = new (neo4j.types.Relationship as any)(5, 3, 2, 'REL', {
        rel: 2
      })

      const segments = [
        new (neo4j.types.PathSegment as any)(start, rel1, middle),
        new (neo4j.types.PathSegment as any)(middle, rel2, end)
      ]
      const path = new (neo4j.types.Path as any)(start, end, segments)

      const records = [
        new Record(
          ['"n"'],
          [new (neo4j.types.Node as any)('1', ['Person'], { prop1: 'prop1' })]
        ) as any,
        new Record(['"n"'], [path]) as any
      ]
      // When
      const res = records.map(record => recordToStringArray(record))

      // Then
      expect(res).toEqual([
        ['(:Person {prop1: "prop1"})'],
        [
          '(:X {x: 1.0})-[:REL {rel: 1.0}]->(:Y {y: 1})<-[:REL {rel: 2.0}]-(:Z {z: "1"})'
        ]
      ])
    })

    test('recordToStringArray handles duration', () => {
      // Given
      const records = [
        new Record(
          ['"n"'],
          [new (neo4j.types.Duration as any)(1, 2, 3, 4)]
        ) as any
      ]
      // When
      const res = records.map(record => recordToStringArray(record))

      // Then
      expect(res).toEqual([['P1M2DT3S']])
    })
  })

  describe('recordToJSONMapper', () => {
    describe('Nodes', () => {
      test('handles integer values', () => {
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new (neo4j.int as any)(3),
          baz: new (neo4j.int as any)(1416268800000),
          bax: new (neo4j.int as any)(9907199254740991) // Larger than Number.MAX_SAFE_INTEGER, but still in 64 bit int range
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: new (neo4j.int as any)(3),
              baz: new (neo4j.int as any)(1416268800000),
              bax: new (neo4j.int as any)(9907199254740991)
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles string values', () => {
        const node = new (neo4j.types.Node as any)(1, ['foo'], { bar: 'baz' })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.Time(11, 1, 12, 0, 0)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.LocalTime(11, 1, 12, 0)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.DateTime(1970, 1, 1, 11, 1, 12, 0, 0)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.LocalDateTime(1970, 1, 1, 11, 1, 12, 0)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.Point(1, 10, 5, 15)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
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
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.Duration(10, 5, 1, 0)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 'P10M5DT1S'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles long duration values', () => {
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.Duration(24146, 2, 52641, 545000000)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            elementId: '1',
            identity: 1,
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 'P2012Y2M2DT14H37M21.545S'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles smaller duration values', () => {
        const node = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new neo4j.types.Duration(0, 0, 100, 0)
        })
        const record = new (neo4j.types.Record as any)(['n'], [node])
        const expected = {
          n: {
            identity: 1,
            elementId: '1',
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: 'PT1M40S'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })

    describe('Relationships', () => {
      test('handles integer values', () => {
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new (neo4j.int as any)(3)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            elementId: '1',
            startNodeElementId: '2',
            endNodeElementId: '3',
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            properties: {
              bar: new (neo4j.int as any)(3)
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles string values', () => {
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: 'baz'
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            elementId: '1',
            identity: 1,
            start: 2,
            end: 3,
            startNodeElementId: '2',
            endNodeElementId: '3',
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
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.Date(1970, 1, 1)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            elementId: '1',
            identity: 1,
            start: 2,
            end: 3,
            startNodeElementId: '2',
            endNodeElementId: '3',
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
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.Time(11, 1, 12, 0, 0)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementId: '1',
            startNodeElementId: '2',
            endNodeElementId: '3',
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
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.LocalTime(11, 1, 12, 0)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementId: '1',
            startNodeElementId: '2',
            endNodeElementId: '3',
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
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.DateTime(1970, 1, 1, 11, 1, 12, 0, 0)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            elementId: '1',
            startNodeElementId: '2',
            endNodeElementId: '3',
            type: 'foo',
            properties: {
              bar: '1970-01-01T11:01:12Z'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles local datetime values', () => {
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.LocalDateTime(1970, 1, 1, 11, 1, 12, 0)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementType: 'relationship',
            type: 'foo',
            elementId: '1',
            startNodeElementId: '2',
            endNodeElementId: '3',
            properties: {
              bar: '1970-01-01T11:01:12'
            }
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })

      test('handles point values', () => {
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.Point(1, 10, 5, 15)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            identity: 1,
            start: 2,
            end: 3,
            elementId: '1',
            startNodeElementId: '2',
            endNodeElementId: '3',
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
        const relationship = new (neo4j.types.Relationship as any)(
          1,
          2,
          3,
          'foo',
          {
            bar: new neo4j.types.Duration(10, 5, 1, 0)
          }
        )
        const record = new (neo4j.types.Record as any)(['r'], [relationship])
        const expected = {
          r: {
            elementId: '1',
            identity: 1,
            start: 2,
            startNodeElementId: '2',
            end: 3,
            endNodeElementId: '3',
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
        const node1 = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new (neo4j.int as any)(3)
        })
        const relationship = new (neo4j.types.Relationship as any)(
          3,
          1,
          2,
          'bom',
          {
            bar: 'apa'
          }
        )
        const node2 = new (neo4j.types.Node as any)(2, ['bam'], {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const record = new (neo4j.types.Record as any)(
          ['n1', 'r1', 'n2'],
          [node1, relationship, node2]
        )
        const expected = {
          n1: {
            identity: 1,
            elementId: '1',
            elementType: 'node',
            labels: ['foo'],
            properties: {
              bar: new (neo4j.int as any)(3)
            }
          },
          r1: {
            elementId: '3',
            elementType: 'relationship',
            end: 2,
            endNodeElementId: '2',
            identity: 3,
            properties: {
              bar: 'apa'
            },
            start: 1,
            startNodeElementId: '1',
            type: 'bom'
          },
          n2: {
            identity: 2,
            elementId: '2',
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
        const node1 = new (neo4j.types.Node as any)(1, ['foo'], {
          bar: new (neo4j.int as any)(3)
        })
        const relationship = new (neo4j.types.Relationship as any)(
          3,
          1,
          2,
          'bom',
          {
            bar: 'apa'
          }
        )
        const node2 = new (neo4j.types.Node as any)(2, ['bam'], {
          bar: new neo4j.types.Date(1970, 1, 1)
        })
        const path = new (neo4j.types.Path as any)(node1, node2, [
          new (neo4j.types.PathSegment as any)(node1, relationship, node2)
        ])
        const record = new (neo4j.types.Record as any)(['p'], [path])
        const expected = {
          p: {
            length: 1,
            start: {
              identity: 1,
              elementId: '1',
              elementType: 'node',
              labels: ['foo'],
              properties: {
                bar: new (neo4j.int as any)(3)
              }
            },
            end: {
              identity: 2,
              elementId: '2',
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
                  elementId: '1',
                  elementType: 'node',
                  labels: ['foo'],
                  properties: {
                    bar: new (neo4j.int as any)(3)
                  }
                },
                relationship: {
                  identity: 3,
                  elementId: '3',
                  elementType: 'relationship',
                  type: 'bom',
                  start: 1,
                  startNodeElementId: '1',
                  end: 2,
                  endNodeElementId: '2',
                  properties: {
                    bar: 'apa'
                  }
                },
                end: {
                  identity: 2,
                  elementId: '2',
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
        const record = new (neo4j.types.Record as any)(
          ['foo'],
          [
            {
              data: [
                new (neo4j.int as any)(1),
                'car',
                new neo4j.types.Point(1, 10, 5, 15),
                new neo4j.types.Date(1970, 1, 1)
              ]
            }
          ]
        )
        const expected = {
          foo: {
            data: [
              new (neo4j.int as any)(1),
              'car',
              { srid: 1, x: 10, y: 5, z: 15 },
              '1970-01-01'
            ]
          }
        }

        expect(recordToJSONMapper(record)).toEqual(expected)
      })
    })
  })
})
