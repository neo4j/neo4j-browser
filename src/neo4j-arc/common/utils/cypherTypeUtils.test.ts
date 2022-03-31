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

import { Node, Path, PathSegment, Relationship } from 'neo4j-driver-core'
import { extractNodesAndRels } from './driverUtils'

describe('extractNodesAndRels', () => {
  test('should map bolt records with a path to nodes and relationships', () => {
    const startNode = new Node(1, ['Person'], {
      prop1: 'prop1'
    })
    const endNode = new Node(2, ['Movie'], {
      prop2: 'prop2'
    })
    const relationship = new Relationship(
      3,
      startNode.identity,
      endNode.identity,
      'ACTED_IN',
      {}
    )
    const pathSegment = new PathSegment(startNode, relationship, endNode)
    const path = new Path(startNode, endNode, [pathSegment])
    const boltRecord: any = {
      keys: ['p'],
      get: () => path
    }

    const { nodes, relationships } = extractNodesAndRels([boltRecord])
    expect(nodes.length).toBe(2)
    const graphNodeStart = nodes.filter(node => node.id === '1')[0]
    expect(graphNodeStart).toBeDefined()
    expect(graphNodeStart.labels).toEqual(['Person'])
    expect(graphNodeStart.properties).toEqual({ prop1: 'prop1' })
    const graphNodeEnd = nodes.filter(node => node.id === '2')[0]
    expect(graphNodeEnd).toBeDefined()
    expect(graphNodeEnd.labels).toEqual(['Movie'])
    expect(graphNodeEnd.properties).toEqual({ prop2: 'prop2' })
    expect(relationships.length).toBe(1)
    expect(relationships[0].id).toEqual('3')
    expect(relationships[0].startNodeId).toEqual('1')
    expect(relationships[0].endNodeId).toEqual('2')
    expect(relationships[0].type).toEqual('ACTED_IN')
    expect(relationships[0].properties).toEqual({})
  })
})
