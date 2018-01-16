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
import { applyGraphTypes } from './boltMappings'

describe('applyGraphTypes', () => {
  test('should work with undefined', () => {
    let x
    const result = applyGraphTypes(x)
    const expUndefined = applyGraphTypes(undefined)
    expect(result).toBeUndefined()
    expect(expUndefined).toBeUndefined()
  })

  test('should work with null', () => {
    const result = applyGraphTypes(null)
    expect(result).toBeNull()
  })

  test('should work with number', () => {
    const result = applyGraphTypes(12345)
    expect(result).toEqual(12345)
  })

  test('should work with negative number', () => {
    const result = applyGraphTypes(-123)
    expect(result).toEqual(-123)
  })

  test('should work with float', () => {
    const result = applyGraphTypes(123.45)
    expect(result).toEqual(123.45)
  })

  test('should work with negative float', () => {
    const result = applyGraphTypes(-123.45)
    expect(result).toEqual(-123.45)
  })

  test('should work with boolean', () => {
    let x = true
    const result = applyGraphTypes(true)
    const xResult = applyGraphTypes(x)
    expect(result).toEqual(true)
    expect(xResult).toEqual(x)
  })

  test('should work with string', () => {
    const result = applyGraphTypes('some string')
    expect(result).toEqual('some string')
  })

  test('should work with empty string', () => {
    const result = applyGraphTypes('')
    expect(result).toEqual('')
  })

  test('should work with empty object', () => {
    const input = {}
    const result = applyGraphTypes(input)
    expect(result).toEqual(input)
  })

  test('should work with custom object', () => {
    const input = {
      prop1: null,
      prop2: 33,
      prop3: 33.22,
      prop4: 'a string',
      prop5: true,
      prop6: { prop1: 1, prop2: 'test' }
    }

    const result = applyGraphTypes(input)

    expect(result).toBeTruthy()
    expect(result.prop1).toBeNull()
    expect(result.prop2).toEqual(33)
    expect(result.prop3).toEqual(33.22)
    expect(result.prop4).toEqual('a string')
    expect(result.prop5).toEqual(true)
    expect(result.prop6.prop1).toEqual(1)
    expect(result.prop6.prop2).toEqual('test')
  })

  test('should work with empty array', () => {
    const input = []
    const result = applyGraphTypes([])
    expect(result).toEqual(input)
  })

  test('should work with array', () => {
    const inputArray = ['str1', 'str2', 'srtr3']
    const result = applyGraphTypes(inputArray)
    expect(Array.isArray(result)).toEqual(true)
    inputArray.forEach((item, index) => {
      expect(item).toEqual(result[index])
    })
  })

  test('should apply integer type', () => {
    const rawNumber = { low: 5, high: 0 }
    const typedNumber = applyGraphTypes(rawNumber)
    expect(typedNumber).toBeInstanceOf(neo4j.Integer)
  })

  test('should apply node type', () => {
    const rawNode = {
      labels: ['Test'],
      properties: [],
      identity: { low: 5, high: 0 }
    }

    const typedNode = applyGraphTypes(rawNode)
    expect(typedNode).toBeInstanceOf(neo4j.types.Node)
    expect(typedNode.identity).toBeInstanceOf(neo4j.Integer)
  })

  test('should apply node type with properties of type null, integer, string, object, array', () => {
    const properties = {
      prop1: null,
      prop2: 33,
      prop3: 33.22,
      prop4: 'a string',
      prop5: true,
      prop6: { prop1: 1, prop2: 'test' },
      prop7: { prop1: { low: 3, high: 0 }, prop2: 'test' },
      prop8: { prop1: { low: 3, high: 0 }, prop2: { str: 'Some string' } },
      prop9: {
        prop1: ['array str', 'me too'],
        prop2: [12, 32, 44],
        prop3: [{ p1: true, p2: 'tenant' }, { p1: null }]
      },
      prop10: undefined
    }

    const rawNode = {
      labels: ['Test'],
      properties: properties,
      identity: { low: 5, high: 0 }
    }

    const typedNode = applyGraphTypes(rawNode)
    expect(typedNode).toBeInstanceOf(neo4j.types.Node)
    expect(typedNode.identity).toBeInstanceOf(neo4j.Integer)

    expect(typedNode.properties.prop1).toBeNull()
    expect(typedNode.properties.prop2).toEqual(33)
    expect(typedNode.properties.prop3).toEqual(33.22)
    expect(typedNode.properties.prop4).toEqual('a string')
    expect(typedNode.properties.prop5).toEqual(true)

    expect(typedNode.properties.prop6.prop1).toEqual(1)
    expect(typedNode.properties.prop6.prop2).toEqual('test')

    expect(typedNode.properties.prop7.prop1).toBeInstanceOf(neo4j.Integer)
    expect(typedNode.properties.prop7.prop1.toInt()).toEqual(3)
    expect(typedNode.properties.prop7.prop2).toEqual('test')

    expect(typedNode.properties.prop8.prop2.str).toEqual('Some string')

    expect(Array.isArray(typedNode.properties.prop9.prop1)).toEqual(true)
    expect(typedNode.properties.prop9.prop1[0]).toEqual('array str')
    expect(typedNode.properties.prop9.prop3[0].p1).toEqual(true)
    expect(typedNode.properties.prop9.prop3[0].p2).toEqual('tenant')
    expect(typedNode.properties.prop9.prop3[1].p1).toEqual(null)

    expect(Array.isArray(typedNode.properties.prop9.prop2)).toEqual(true)
    expect(Array.isArray(typedNode.properties.prop9.prop3)).toEqual(true)

    expect(typedNode.properties.prop10).toBeUndefined()
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
    expect(typedNodes[0]).toBeInstanceOf(neo4j.types.Node)
    expect(typedNodes[0].identity).toBeInstanceOf(neo4j.Integer)
    expect(typedNodes[1]).toBeInstanceOf(neo4j.types.Node)
    expect(typedNodes[1].identity).toBeInstanceOf(neo4j.Integer)
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
    expect(typedRelationship).toBeInstanceOf(neo4j.types.Relationship)
    expect(typedRelationship.identity).toBeInstanceOf(neo4j.Integer)
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
    expect(typedRelationships[0]).toBeInstanceOf(neo4j.types.Relationship)
    expect(typedRelationships[0].identity).toBeInstanceOf(neo4j.Integer)
    expect(typedRelationships[0].start).toBeInstanceOf(neo4j.Integer)
    expect(typedRelationships[0].end).toBeInstanceOf(neo4j.Integer)
    expect(typedRelationships[1]).toBeInstanceOf(neo4j.types.Relationship)
    expect(typedRelationships[1].identity).toBeInstanceOf(neo4j.Integer)
    expect(typedRelationships[1].start).toBeInstanceOf(neo4j.Integer)
    expect(typedRelationships[1].end).toBeInstanceOf(neo4j.Integer)
  })

  test('should apply to custom object properties', () => {
    const rawNumber = { low: 5, high: 0 }

    const rawNode = {
      labels: ['Test'],
      properties: [],
      identity: { low: 5, high: 0 }
    }

    const typedObject = applyGraphTypes({ num: rawNumber, node: rawNode })
    expect(typedObject.node).toBeInstanceOf(neo4j.types.Node)
    expect(typedObject.num).toBeInstanceOf(neo4j.Integer)
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
    expect(typedObjects[0].node).toBeInstanceOf(neo4j.types.Node)
    expect(typedObjects[0].num).toBeInstanceOf(neo4j.Integer)
    expect(typedObjects[1].node).toBeInstanceOf(neo4j.types.Node)
    expect(typedObjects[1].num).toBeInstanceOf(neo4j.Integer)
  })

  test('should apply PathSegment type', () => {
    const typedPathSegment = applyGraphTypes(getAPathSegment(5, 10, 1))
    expect(typedPathSegment).toBeTruthy()
    expect(typedPathSegment).toBeInstanceOf(neo4j.types.PathSegment)
    expect(typedPathSegment.start).toBeInstanceOf(neo4j.types.Node)
    expect(typedPathSegment.end).toBeInstanceOf(neo4j.types.Node)
    expect(typedPathSegment.relationship).toBeInstanceOf(
      neo4j.types.Relationship
    )
  })

  test('should apply to array of PathSegment type', () => {
    const segment1 = getAPathSegment(5, 1, 10)
    const segment2 = getAPathSegment(15, 2, 20)

    const typedPathSegments = applyGraphTypes([segment1, segment2])
    expect(typedPathSegments.length).toEqual(2)

    expect(typedPathSegments[0]).toBeInstanceOf(neo4j.types.PathSegment)
    expect(typedPathSegments[0].start).toBeInstanceOf(neo4j.types.Node)
    expect(typedPathSegments[0].end).toBeInstanceOf(neo4j.types.Node)
    expect(typedPathSegments[0].relationship).toBeInstanceOf(
      neo4j.types.Relationship
    )

    expect(typedPathSegments[1]).toBeInstanceOf(neo4j.types.PathSegment)
    expect(typedPathSegments[1].start).toBeInstanceOf(neo4j.types.Node)
    expect(typedPathSegments[1].end).toBeInstanceOf(neo4j.types.Node)
    expect(typedPathSegments[1].relationship).toBeInstanceOf(
      neo4j.types.Relationship
    )
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
    expect(typedPath).toBeInstanceOf(neo4j.types.Path)
    expect(typedPath.start).toBeInstanceOf(neo4j.types.Node)
    expect(typedPath.end).toBeInstanceOf(neo4j.types.Node)

    expect(typedPath.segments.length).toEqual(2)
    expect(typedPath.segments[0]).toBeInstanceOf(neo4j.types.PathSegment)
    expect(typedPath.segments[1]).toBeInstanceOf(neo4j.types.PathSegment)
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
    expect(typedObject.rawNum).toBeInstanceOf(neo4j.Integer)
    expect(typedObject.rawNode).toBeInstanceOf(neo4j.types.Node)
    expect(typedObject.rawRelationship).toBeInstanceOf(neo4j.types.Relationship)
    expect(typedObject.rawPath).toBeInstanceOf(neo4j.types.Path)
    expect(typedObject.rawPath.segments.length).toEqual(2)
    expect(typedObject.rawPath.segments[0]).toBeInstanceOf(
      neo4j.types.PathSegment
    )
    expect(typedObject.rawPath.segments[1]).toBeInstanceOf(
      neo4j.types.PathSegment
    )
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
