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
import { v1 as neo4j } from 'neo4j-driver-alias'
import {
  itemIntToString,
  arrayIntToString,
  extractNodesAndRelationshipsFromRecords,
  extractNodesAndRelationshipsFromRecordsForOldVis,
  extractPlan,
  flattenProperties,
  objIntToString,
  extractFromNeoObjects,
  applyGraphTypes
} from './boltMappings'

describe('boltMappings', () => {
  describe('itemIntToString', () => {
    test('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {
          val: 'hello',
          checker: _ => false,
          converter: _ => false,
          expected: 'hello'
        },
        {
          val: ['hello'],
          checker: _ => false,
          converter: val => false,
          expected: ['hello']
        },
        {
          val: null,
          checker: _ => false,
          converter: _ => false,
          expected: null
        },
        {
          val: { str: 'hello' },
          checker: _ => true,
          converter: val => {
            val.str = val.str.toUpperCase()
            return val
          },
          expected: { str: 'HELLO' }
        }
      ]

      // When and Then
      tests.forEach(test => {
        expect(
          itemIntToString(test.val, {
            intChecker: test.checker,
            intConverter: test.converter
          })
        ).toEqual(test.expected)
      })
    })
  })
  describe('arrayIntToString', () => {
    test('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {
          val: ['hello', 1],
          checker: _ => false,
          converter: val => false,
          expected: ['hello', 1]
        },
        {
          val: ['hello', ['ola', 'hi']],
          checker: val => typeof val === 'string',
          converter: val => val.toUpperCase(),
          expected: ['HELLO', ['OLA', 'HI']]
        },
        {
          val: ['hello', 1],
          checker: val => typeof val === 'string',
          converter: val => val.toUpperCase(),
          expected: ['HELLO', 1]
        }
      ]

      // When and Then
      tests.forEach(test => {
        expect(
          arrayIntToString(test.val, {
            intChecker: test.checker,
            intConverter: test.converter
          })
        ).toEqual(test.expected)
      })
    })
  })
  describe('objIntToString', () => {
    test('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {
          val: { arr: ['hello'] },
          checker: _ => false,
          converter: val => false,
          expected: { arr: ['hello'] }
        },
        {
          val: {
            arr: ['hello', ['ola', 'hi']],
            str: 'hello',
            num: 2,
            obj: {
              num: 3,
              str: 'inner hello'
            }
          },
          checker: val => typeof val === 'string',
          converter: val => val.toUpperCase(),
          expected: {
            arr: ['HELLO', ['OLA', 'HI']],
            str: 'HELLO',
            num: 2,
            obj: {
              num: 3,
              str: 'INNER HELLO'
            }
          }
        }
      ]

      // When and Then
      tests.forEach(test => {
        expect(
          objIntToString(test.val, {
            intChecker: test.checker,
            intConverter: test.converter,
            objectConverter: obj => obj
          })
        ).toEqual(test.expected)
      })
    })
  })

  describe('extractNodesAndRelationshipsFromRecords', () => {
    test.skip('should map bolt records with a path to nodes and relationships', () => {
      let startNode = new neo4j.v1.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      let endNode = new neo4j.v1.types.Node('2', ['Movie'], {
        prop2: 'prop2'
      })
      let relationship = new neo4j.v1.types.Relationship(
        '3',
        startNode.identity,
        endNode.identity,
        'ACTED_IN',
        {}
      )
      let pathSegment = new neo4j.v1.types.PathSegment(
        startNode,
        relationship,
        endNode
      )
      let path = new neo4j.v1.types.Path(startNode, endNode, [pathSegment])
      let boltRecord = {
        keys: ['p'],
        get: key => path
      }

      let { nodes, relationships } = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        neo4j.v1.types
      )
      expect(nodes).to.have.lengthOf(2)
      let graphNodeStart = nodes.filter(node => node.id === '1')[0]
      expect(graphNodeStart).toBeDefined()
      expect(graphNodeStart.labels).toEqual(['Person'])
      expect(graphNodeStart.properties).toEqual({ prop1: 'prop1' })
      let graphNodeEnd = nodes.filter(node => node.id === '2')[0]
      expect(graphNodeEnd).toBeDefined()
      expect(graphNodeEnd.labels).toEqual(['Movie'])
      expect(graphNodeEnd.properties).toEqual({ prop2: 'prop2' })
      expect(relationships).to.have.lengthOf(1)
      expect(relationships[0].id).toEqual('3')
      expect(relationships[0].startNodeId).toEqual('1')
      expect(relationships[0].endNodeId).toEqual('2')
      expect(relationships[0].type).toEqual('ACTED_IN')
      expect(relationships[0].properties).toEqual({})
    })

    test.skip('should map bolt nodes and relationships to graph nodes and relationships', () => {
      let startNode = new neo4j.v1.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      let endNode = new neo4j.v1.types.Node('2', ['Movie'], {
        prop2: 'prop2'
      })
      let relationship = new neo4j.v1.types.Relationship(
        '3',
        startNode.identity,
        endNode.identity,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r', 'n1', 'n2'],
        get: key => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return startNode
          }
          if (key === 'n2') {
            return endNode
          }
        }
      }

      let { nodes, relationships } = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        neo4j.v1.types
      )
      expect(nodes).to.have.lengthOf(2)
      let graphNodeStart = nodes.filter(node => node.id === '1')[0]
      expect(graphNodeStart).toBeDefined()
      expect(graphNodeStart.labels).toEqual(['Person'])
      expect(graphNodeStart.properties).toEqual({ prop1: 'prop1' })
      let graphNodeEnd = nodes.filter(node => node.id === '2')[0]
      expect(graphNodeEnd).toBeDefined()
      expect(graphNodeEnd.labels).toEqual(['Movie'])
      expect(graphNodeEnd.properties).toEqual({ prop2: 'prop2' })
      expect(relationships).to.have.lengthOf(1)
      expect(relationships[0].id).toEqual('3')
      expect(relationships[0].startNodeId).toEqual('1')
      expect(relationships[0].endNodeId).toEqual('2')
      expect(relationships[0].type).toEqual('ACTED_IN')
      expect(relationships[0].properties).toEqual({})
    })

    test.skip('should not include relationships where neither start or end node is not in nodes list', () => {
      let relationship = new neo4j.v1.types.Relationship(
        '3',
        1,
        2,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r'],
        get: key => relationship
      }
      let relationships = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        neo4j.v1.types
      ).relationships
      expect(relationships.length).toBe(0)
    })
    test.skip('should not include relationships where end node is not in nodes list', () => {
      let startNode = new neo4j.v1.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      let relationship = new neo4j.v1.types.Relationship(
        '3',
        startNode.identity,
        2,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r', 'n1'],
        get: key => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return startNode
          }
        }
      }
      let relationships = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        neo4j.v1.types
      ).relationships
      expect(relationships.length).toBe(0)
    })
    test.skip('should not include relationships where start node is not in nodes list', () => {
      let endNode = new neo4j.v1.types.Node('2', ['Movie'], {
        prop2: 'prop2'
      })
      let relationship = new neo4j.v1.types.Relationship(
        '3',
        '1',
        endNode.identity,
        'ACTED_IN',
        {}
      )
      let boltRecord = {
        keys: ['r', 'n1'],
        get: key => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return endNode
          }
        }
      }
      let relationships = extractNodesAndRelationshipsFromRecords(
        [boltRecord],
        neo4j.v1.types
      ).relationships
      expect(relationships.length).toBe(0)
    })
  })
  describe('extractPlan', () => {
    const createPlan = () => {
      return {
        operatorType: 'operatorType',
        arguments: {
          LegacyExpression: 'legacy',
          ExpandExpression: 'expand',
          EstimatedRows: 10,
          Index: 1,
          version: 'version',
          KeyNames: ['keyname'],
          planner: 'planner',
          runtime: 'runtime',
          'planner-impl': 'planner-impl',
          'runtime-impl': 'runtime-impl',
          Signature: 'Signature'
        },
        identifiers: [],
        children: []
      }
    }

    const checkExtractedPlan = extractedPlan => {
      expect(extractedPlan).not.toBeNull()
      expect(extractedPlan.operatorType).toEqual('operatorType')
      expect(extractedPlan.identifiers).toEqual([])
      expect(extractedPlan.operatorType).toEqual('operatorType')
      expect(extractedPlan.LegacyExpression).toEqual('legacy')
      expect(extractedPlan.ExpandExpression).toEqual('expand')
      expect(extractedPlan.EstimatedRows).toEqual(10)
      expect(extractedPlan.Index).toEqual(1)
      expect(extractedPlan.version).toEqual('version')
      expect(extractedPlan.KeyNames).toEqual(['keyname'])
      expect(extractedPlan.planner).toEqual('planner')
      expect(extractedPlan.runtime).toEqual('runtime')
      expect(extractedPlan['planner-impl']).toEqual('planner-impl')
      expect(extractedPlan['runtime-impl']).toEqual('runtime-impl')
      expect(extractedPlan.Signature).toEqual('Signature')
    }

    test('should extract plan from result summary', () => {
      // Given
      const result = {
        summary: {
          plan: createPlan()
        }
      }
      const extractedPlan = extractPlan(result).root
      checkExtractedPlan(extractedPlan)
    })

    test('should extract profile from result summary', () => {
      // Given
      const profile = createPlan()
      profile.dbHits = 20
      profile.rows = 14
      const result = {
        summary: {
          profile: profile
        }
      }
      const extractedPlan = extractPlan(result).root
      checkExtractedPlan(extractedPlan)
      expect(extractedPlan.DbHits).toEqual(20)
      expect(extractedPlan.Rows).toEqual(14)
    })

    test.skip('should return null if no plan or profile is available', () => {
      const result = {
        summary: {}
      }
      expect(extractPlan(result)).toBeNull()
    })
  })
  describe('flattenProperties', () => {
    test('should map properties to object when properties exist', () => {
      // Given
      const result = [[{ properties: { foo: 'bar' } }]]
      const expectedResult = [[{ foo: 'bar' }]]

      // When
      const flattenedProperties = flattenProperties(result)

      // Then
      expect(flattenedProperties).toEqual(expectedResult)
    })
    test('should not map properties to object when properties do not exist', () => {
      // Given
      const result = [[{ x: { foo: 'bar' } }]]

      // When
      const flattenedProperties = flattenProperties(result)

      // Then
      expect(flattenedProperties).toEqual(result)
    })
  })
  describe('extractNodesAndRelationshipsFromRecordsForOldVis', () => {
    test('should recursively look for graph items', () => {
      // Given
      const firstNode = new neo4j.types.Node('1', ['Person'], {
        prop1: 'prop1'
      })
      const nodeCollection = [
        new neo4j.types.Node('2', ['Person'], { prop1: 'prop1' }),
        new neo4j.types.Node('3', ['Person'], { prop1: 'prop1' }),
        new neo4j.types.Node('4', ['Person'], { prop1: 'prop1' })
      ]
      const boltRecord = {
        keys: ['n', 'c'],
        get: key => {
          if (key === 'n') {
            return firstNode
          }
          if (key === 'c') {
            return nodeCollection
          }
        }
      }
      const records = [boltRecord]

      // When
      const out = extractNodesAndRelationshipsFromRecordsForOldVis(
        records,
        neo4j.types,
        false,
        {
          intChecker: () => true,
          intConverter: a => a
        }
      )

      // Then
      expect(out.nodes.length).toEqual(4)
    })
    test('should find items in paths with segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new neo4j.types.Node(1, ['X'], { x: 1 })
      const rel1 = new neo4j.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const end1 = new neo4j.types.Node(2, ['Y'], { y: 1 })
      const rel2 = new neo4j.types.Relationship(6, 4, 5, 'REL2', { rel: 2 })
      const end = new neo4j.types.Node(5, ['Y'], { y: 2 })
      const segments = [
        new neo4j.types.PathSegment(start, rel1, end1),
        new neo4j.types.PathSegment(end1, rel2, end)
      ]
      const path = new neo4j.types.Path(start, end, segments)
      const boltRecord = {
        keys: ['p'],
        get: key => {
          if (key === 'p') return path
        }
      }
      const records = [boltRecord]

      // When
      const out = extractNodesAndRelationshipsFromRecordsForOldVis(
        records,
        neo4j.types,
        false,
        converters
      )

      // Then
      expect(out.nodes.length).toEqual(4)
    })
    test('should find items in paths zero segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new neo4j.types.Node(1, ['X'], { x: 2 })
      const end = start
      const segments = []
      const path = new neo4j.types.Path(start, end, segments)
      const boltRecord = {
        keys: ['p'],
        get: key => {
          if (key === 'p') return path
        }
      }
      const records = [boltRecord]

      // When
      const out = extractNodesAndRelationshipsFromRecordsForOldVis(
        records,
        neo4j.types,
        false,
        converters
      )

      // Then
      expect(out.nodes.length).toEqual(1)
      expect(out.nodes[0].properties.x).toEqual(2)
    })
  })
  describe('extractFromNeoObjects', () => {
    test('should extract objects from paths with zero segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new neo4j.types.Node(1, ['X'], { x: 1 })
      const end = start
      const segments = []
      const path = new neo4j.types.Path(start, end, segments)

      // When
      const result = extractFromNeoObjects(path, converters)
      // Then
      expect(result.length).toBe(1)
      expect(result[0].x).toBe(1)
    })
    test('should extract objects from paths with one segment', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new neo4j.types.Node(1, ['X'], { x: 1 })
      const end = new neo4j.types.Node(2, ['Y'], { y: 1 })
      const rel = new neo4j.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const segments = [new neo4j.types.PathSegment(start, rel, end)]
      const path = new neo4j.types.Path(start, end, segments)

      // When
      const result = extractFromNeoObjects(path, converters)

      // Then
      expect(result.length).toBe(3)
      expect(result[0].x).toBe(1)
      expect(result[1].rel).toBe(1)
      expect(result[2].y).toBe(1)
    })
    test('should extract objects from paths with multiple segments', () => {
      // Given
      const converters = {
        intChecker: () => false,
        intConverter: a => a,
        objectConverter: extractFromNeoObjects
      }
      const start = new neo4j.types.Node(1, ['X'], { x: 1 })
      const rel1 = new neo4j.types.Relationship(3, 1, 2, 'REL', { rel: 1 })
      const end1 = new neo4j.types.Node(2, ['Y'], { y: 1 })
      const rel2 = new neo4j.types.Relationship(6, 4, 5, 'REL2', { rel: 2 })
      const end = new neo4j.types.Node(5, ['Y'], { y: 2 })
      const segments = [
        new neo4j.types.PathSegment(start, rel1, end1),
        new neo4j.types.PathSegment(end1, rel2, end)
      ]
      const path = new neo4j.types.Path(start, end, segments)

      // When
      const result = extractFromNeoObjects(path, converters)

      // Then
      expect(result.length).toBe(6)
      expect(result[0].x).toBe(1)
      expect(result[1].rel).toBe(1)
      expect(result[2].y).toBe(1)
      expect(result[3].y).toBe(1) // Same as above line
      expect(result[4].rel).toBe(2)
      expect(result[5].y).toBe(2)
    })
  })
  describe('applyGraphTypes', () => {
    test('should apply integer type', () => {
      const rawNumber = { low: 5, high: 0 }
      const typedNumber = applyGraphTypes(rawNumber)
      expect(typedNumber instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply node type', () => {
      const rawNode = {
        labels: ['Test'],
        properties: [],
        identity: { low: 5, high: 0 }
      }

      const typedNode = applyGraphTypes(rawNode)
      expect(typedNode instanceof neo4j.types.Node).toEqual(true)
      expect(typedNode.identity instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply node type to array of data', () => {
      const rawNodes = [
        {
          labels: ['Test'],
          properties: [],
          identity: { low: 5, high: 0 }
        },
        {
          labels: ['Test2'],
          properties: [],
          identity: { low: 15, high: 0 }
        }
      ]

      const typedNodes = applyGraphTypes(rawNodes)
      expect(typedNodes.length).toEqual(2)
      expect(typedNodes[0] instanceof neo4j.types.Node).toEqual(true)
      expect(typedNodes[0].identity instanceof neo4j.Integer).toEqual(true)
      expect(typedNodes[1] instanceof neo4j.types.Node).toEqual(true)
      expect(typedNodes[1].identity instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply relationship type', () => {
      const rawRelationship = {
        type: 'TestType',
        properties: [],
        identity: { low: 1, high: 0 },
        start: { low: 5, high: 0 },
        end: { low: 10, high: 0 }
      }

      const typedRelationship = applyGraphTypes(rawRelationship)
      expect(typedRelationship instanceof neo4j.types.Relationship).toEqual(
        true
      )
      expect(typedRelationship.identity instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply relationship type to array of data', () => {
      const rawRelationships = [
        {
          type: 'TestType',
          properties: [],
          identity: { low: 1, high: 0 },
          start: { low: 5, high: 0 },
          end: { low: 10, high: 0 }
        },
        {
          type: 'TestType_2',
          properties: [],
          identity: { low: 2, high: 0 },
          start: { low: 15, high: 0 },
          end: { low: 20, high: 0 }
        }
      ]

      const typedRelationships = applyGraphTypes(rawRelationships)
      expect(typedRelationships.length).toEqual(2)
      expect(typedRelationships[0] instanceof neo4j.types.Relationship).toEqual(
        true
      )
      expect(typedRelationships[0].identity instanceof neo4j.Integer).toEqual(
        true
      )
      expect(typedRelationships[0].start instanceof neo4j.Integer).toEqual(true)
      expect(typedRelationships[0].end instanceof neo4j.Integer).toEqual(true)
      expect(typedRelationships[1] instanceof neo4j.types.Relationship).toEqual(
        true
      )
      expect(typedRelationships[1].identity instanceof neo4j.Integer).toEqual(
        true
      )
      expect(typedRelationships[1].start instanceof neo4j.Integer).toEqual(true)
      expect(typedRelationships[1].end instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply to custom object properties', () => {
      const rawNumber = { low: 5, high: 0 }

      const rawNode = {
        labels: ['Test'],
        properties: [],
        identity: { low: 5, high: 0 }
      }

      const typedObject = applyGraphTypes({ num: rawNumber, node: rawNode })
      expect(typedObject.node instanceof neo4j.types.Node).toEqual(true)
      expect(typedObject.num instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply to array of custom object properties', () => {
      const rawNumber1 = { low: 5, high: 0 }

      const rawNode1 = {
        labels: ['Test-1'],
        properties: [],
        identity: { low: 5, high: 0 }
      }

      const rawNumber2 = { low: 10, high: 0 }

      const rawNode2 = {
        labels: ['Test-2'],
        properties: [],
        identity: { low: 10, high: 0 }
      }

      const typedObjects = applyGraphTypes([
        { num: rawNumber1, node: rawNode1 },
        { num: rawNumber2, node: rawNode2 }
      ])
      expect(typedObjects.length).toEqual(2)
      expect(typedObjects[0].node instanceof neo4j.types.Node).toEqual(true)
      expect(typedObjects[0].num instanceof neo4j.Integer).toEqual(true)
      expect(typedObjects[1].node instanceof neo4j.types.Node).toEqual(true)
      expect(typedObjects[1].num instanceof neo4j.Integer).toEqual(true)
    })

    test('should apply PathSegment type', () => {
      const typedPathSegment = applyGraphTypes(getAPathSegment(5, 10, 1))
      expect(typedPathSegment).toBeTruthy()
      expect(typedPathSegment instanceof neo4j.types.PathSegment)
      expect(typedPathSegment.start instanceof neo4j.types.Node).toEqual(true)
      expect(typedPathSegment.end instanceof neo4j.types.Node).toEqual(true)
      expect(
        typedPathSegment.relationship instanceof neo4j.types.Relationship
      ).toEqual(true)
    })

    test('should apply to array of PathSegment type', () => {
      const segment1 = getAPathSegment(5, 1, 10)
      const segment2 = getAPathSegment(15, 2, 20)

      const typedPathSegments = applyGraphTypes([segment1, segment2])
      expect(typedPathSegments.length).toEqual(2)

      expect(typedPathSegments[0] instanceof neo4j.types.PathSegment).toEqual(
        true
      )
      expect(typedPathSegments[0].start instanceof neo4j.types.Node).toEqual(
        true
      )
      expect(typedPathSegments[0].end instanceof neo4j.types.Node).toEqual(true)
      expect(
        typedPathSegments[0].relationship instanceof neo4j.types.Relationship
      ).toEqual(true)

      expect(typedPathSegments[1] instanceof neo4j.types.PathSegment).toEqual(
        true
      )
      expect(typedPathSegments[1].start instanceof neo4j.types.Node).toEqual(
        true
      )
      expect(typedPathSegments[1].end instanceof neo4j.types.Node).toEqual(true)
      expect(
        typedPathSegments[1].relationship instanceof neo4j.types.Relationship
      ).toEqual(true)
    })

    test('should apply Path type', () => {
      const typedPath = applyGraphTypes(
        getAPath([
          { start: 5, end: 10, relationship: 1 },
          {
            start: 10,
            end: 15,
            relationship: 2
          }
        ])
      )
      expect(typedPath).toBeTruthy()
      expect(typedPath instanceof neo4j.types.Path)
      expect(typedPath.start instanceof neo4j.types.Node).toEqual(true)
      expect(typedPath.end instanceof neo4j.types.Node).toEqual(true)

      expect(typedPath.segments.length).toEqual(2)
      expect(typedPath.segments[0] instanceof neo4j.types.PathSegment)
      expect(typedPath.segments[1] instanceof neo4j.types.PathSegment)
    })

    test('should apply to a complex object of graph types', () => {
      const rawNode = {
        labels: ['Test'],
        properties: [],
        identity: { low: 5, high: 0 }
      }
      const rawNum = { low: 100, high: 0 }
      const rawPath = getAPath([
        { start: 5, end: 10, relationship: 1 },
        { start: 10, end: 15, relationship: 2 }
      ])
      const rawRelationship = {
        type: 'TestType',
        properties: [],
        identity: { low: 1, high: 0 },
        start: { low: 5, high: 0 },
        end: { low: 10, high: 0 }
      }

      const typedObject = applyGraphTypes({
        rawNum,
        rawNode,
        rawRelationship,
        rawPath
      })
      expect(typedObject).toBeTruthy()
      expect(typedObject.rawNum instanceof neo4j.Integer)
      expect(typedObject.rawNode instanceof neo4j.types.Node).toEqual(true)
      expect(
        typedObject.rawRelationship instanceof neo4j.types.Relationship
      ).toEqual(true)
      expect(typedObject.rawPath instanceof neo4j.types.Path).toEqual(true)
      expect(typedObject.rawPath.segments.length).toEqual(2)
      expect(typedObject.rawPath.segments[0] instanceof neo4j.types.PathSegment)
      expect(typedObject.rawPath.segments[1] instanceof neo4j.types.PathSegment)
    })
  })
})

const getAPathSegment = (startId, relId, endId) => {
  const rawStartNode = {
    labels: ['From'],
    properties: [],
    identity: { low: startId, high: 0 }
  }

  const rawEndNode = {
    labels: ['To'],
    properties: [],
    identity: { low: endId, high: 0 }
  }

  const rawRelationship = {
    type: 'TestType',
    properties: [],
    identity: { low: relId, high: 0 },
    start: { low: startId, high: 0 },
    end: { low: endId, high: 0 }
  }

  return { start: rawStartNode, end: rawEndNode, relationship: rawRelationship }
}

const getAPath = segmentList => {
  const segments = segmentList.map(segment =>
    getAPathSegment(segment.start, segment.relationship, segment.end)
  )
  return {
    start: segments[0].start,
    end: segments[segments.length - 1].end,
    segments
  }
}
