/* global neo4j */
import { expect } from 'chai'
import { itemIntToString, arrayIntToString, objIntToString, extractNodesAndRelationshipsFromRecords, extractPlan } from './boltMappings'

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
    it('should map bolt records with a path to nodes and relationships', () => {
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

    it('should map bolt nodes and relationships to graph nodes and relationships', () => {
      let startNode = new neo4j.v1.types.Node('1', ['Person'], {prop1: 'prop1'})
      let endNode = new neo4j.v1.types.Node('2', ['Movie'], {prop2: 'prop2'})
      let relationship = new neo4j.v1.types.Relationship('3', startNode.identity, endNode.identity, 'ACTED_IN', {})
      let boltRecord = {
        keys: ['r', 'n1', 'n2'],
        get: (key) => {
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

    it('should not include relationships where neither start or end node is not in nodes list', () => {
      let relationship = new neo4j.v1.types.Relationship('3', 1, 2, 'ACTED_IN', {})
      let boltRecord = {
        keys: ['r'],
        get: (key) => relationship
      }
      let relationships = extractNodesAndRelationshipsFromRecords([boltRecord], neo4j.v1.types).relationships
      expect(relationships).to.have.length(0)
    })
    it('should not include relationships where end node is not in nodes list', () => {
      let startNode = new neo4j.v1.types.Node('1', ['Person'], {prop1: 'prop1'})
      let relationship = new neo4j.v1.types.Relationship('3', startNode.identity, 2, 'ACTED_IN', {})
      let boltRecord = {
        keys: ['r', 'n1'],
        get: (key) => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return startNode
          }
        }
      }
      let relationships = extractNodesAndRelationshipsFromRecords([boltRecord], neo4j.v1.types).relationships
      expect(relationships).to.have.length(0)
    })
    it('should not include relationships where start node is not in nodes list', () => {
      let endNode = new neo4j.v1.types.Node('2', ['Movie'], {prop2: 'prop2'})
      let relationship = new neo4j.v1.types.Relationship('3', '1', endNode.identity, 'ACTED_IN', {})
      let boltRecord = {
        keys: ['r', 'n1'],
        get: (key) => {
          if (key === 'r') {
            return relationship
          }
          if (key === 'n1') {
            return endNode
          }
        }
      }
      let relationships = extractNodesAndRelationshipsFromRecords([boltRecord], neo4j.v1.types).relationships
      expect(relationships).to.have.length(0)
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
          'runtime-impl': 'runtime-impl'
        },
        identifiers: [],
        children: []
      }
    }

    const checkExtractedPlan = (extractedPlan) => {
      expect(extractedPlan).to.not.be.null
      expect(extractedPlan.operatorType).to.equal('operatorType')
      expect(extractedPlan.identifiers).to.deep.equal([])
      expect(extractedPlan.operatorType).to.equal('operatorType')
      expect(extractedPlan.LegacyExpression).to.equal('legacy')
      expect(extractedPlan.ExpandExpression).to.equal('expand')
      expect(extractedPlan.EstimatedRows).to.equal(10)
      expect(extractedPlan.Index).to.equal(1)
      expect(extractedPlan.version).to.equal('version')
      expect(extractedPlan.KeyNames).to.deep.equal(['keyname'])
      expect(extractedPlan.planner).to.equal('planner')
      expect(extractedPlan.runtime).to.equal('runtime')
      expect(extractedPlan['planner-impl']).to.equal('planner-impl')
      expect(extractedPlan['runtime-impl']).to.equal('runtime-impl')
    }

    it('should extract plan from result summary', () => {
      // Given
      const result = {
        summary: {
          plan: createPlan()
        }
      }
      const extractedPlan = extractPlan(result).root
      checkExtractedPlan(extractedPlan)
    })

    it('should extract profile from result summary', () => {
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
      expect(extractedPlan.DbHits).to.equal(20)
      expect(extractedPlan.Rows).to.equal(14)
    })

    it('should return null if no plan or profile is available', () => {
      const result = {
        summary: {}
      }
      expect(extractPlan(result)).to.be.null
    })
  })
})
