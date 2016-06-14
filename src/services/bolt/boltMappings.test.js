/* global neo4j */
import { expect } from 'chai'
import { itemIntToString, arrayIntToString, objIntToString, extractNodesAndRelationshipsFromRecords } from './boltMappings'

describe('boltMappings', () => {
  describe('itemIntToString', () => {
    it('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {val: 'hello', checker: (_) => false, converter: (_) => false, expected: 'hello'},
        {val: ['hello'], checker: (_) => false, converter: (val) => false, expected: ['hello']},
        {val: null, checker: (_) => false, converter: (_) => false, expected: null},
        {val: {str: 'hello'}, checker: (_) => true, converter: (val) => {
          val.str = val.str.toUpperCase()
          return val
        }, expected: {str: 'HELLO'}}
      ]

      // When and Then
      tests.forEach((test) => {
        expect(itemIntToString(test.val, test.checker, test.converter)).to.deep.equal(test.expected)
      })
    })
  })
  describe('arrayIntToString', () => {
    it('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {val: ['hello', 1], checker: (_) => false, converter: (val) => false, expected: ['hello', 1]},
        {val: ['hello', ['ola', 'hi']], checker: (val) => typeof val === 'string', converter: (val) => val.toUpperCase(), expected: ['HELLO', ['OLA', 'HI']]},
        {val: ['hello', 1], checker: (val) => typeof val === 'string', converter: (val) => val.toUpperCase(), expected: ['HELLO', 1]}
      ]

      // When and Then
      tests.forEach((test) => {
        expect(arrayIntToString(test.val, test.checker, test.converter)).to.deep.equal(test.expected)
      })
    })
  })
  describe('objIntToString', () => {
    it('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {val: {arr: ['hello']}, checker: (_) => false, converter: (val) => false, expected: {arr: ['hello']}},
        {val: {
          arr: ['hello', ['ola', 'hi']],
          str: 'hello',
          num: 2,
          obj: {
            num: 3,
            str: 'inner hello'
          }
        }, checker: (val) => typeof val === 'string', converter: (val) => val.toUpperCase(), expected: {
          arr: ['HELLO', ['OLA', 'HI']],
          str: 'HELLO',
          num: 2,
          obj: {
            num: 3,
            str: 'INNER HELLO'
          }
        }
      }]

      // When and Then
      tests.forEach((test) => {
        expect(objIntToString(test.val, test.checker, test.converter)).to.deep.equal(test.expected)
      })
    })
  })

  describe('extractNodesAndRelationshipsFromRecords', () => {
    it('should map bolt records to nodes and relationships', () => {
      let startNode = new neo4j.v1.types.Node('1', ['Person'], {prop1: 'prop1'})
      let endNode = new neo4j.v1.types.Node('2', ['Movie'], {prop2: 'prop2'})
      let relationship = new neo4j.v1.types.Relationship('3', startNode.identity, endNode.identity, 'ACTED_IN', {})
      let pathSegment = new neo4j.v1.types.PathSegment(startNode, relationship, endNode)
      let path = new neo4j.v1.types.Path(startNode, endNode, [pathSegment])
      let boltRecord = {
        keys: ['p'],
        get: (key) => path
      }

      let {nodes, relationships} = extractNodesAndRelationshipsFromRecords([boltRecord], neo4j.v1.types)
      expect(nodes).to.have.lengthOf(2)
      let graphNodeStart = nodes.filter((node) => node.id === '1')[0]
      expect(graphNodeStart).to.exist
      expect(graphNodeStart.labels).to.deep.equal(['Person'])
      expect(graphNodeStart.properties).to.deep.equal({prop1: 'prop1'})
      let graphNodeEnd = nodes.filter((node) => node.id === '2')[0]
      expect(graphNodeEnd).to.exist
      expect(graphNodeEnd.labels).to.deep.equal(['Movie'])
      expect(graphNodeEnd.properties).to.deep.equal({prop2: 'prop2'})
      expect(relationships).to.have.lengthOf(1)
      expect(relationships[0].id).to.equal('3')
      expect(relationships[0].startNodeId).to.equal('1')
      expect(relationships[0].endNodeId).to.equal('2')
      expect(relationships[0].type).to.equal('ACTED_IN')
      expect(relationships[0].properties).to.deep.equal({})
    })
  })
})
