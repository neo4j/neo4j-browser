/* global neo4j */
import chai from 'chai'
import {mapBoltRecordsToGraph} from './mapper'

const expect = chai.expect

describe('mapper', () => {
  it('should map bolt response to neo graph object', () => {
    let startNode = new neo4j.v1.types.Node(1, 'Movie', {})
    let endNode = new neo4j.v1.types.Node(2, 'Movie', {})
    let relationship = new neo4j.v1.types.Relationship(3, startNode, endNode, 'ACTED_IN', {})
    let pathSegment = new neo4j.v1.types.PathSegment(startNode, relationship, endNode)
    let path = new neo4j.v1.types.Path(startNode, endNode, [pathSegment])
    let boltRecord = {
      keys: ['p'],
      get: (key) => path
    }
    expect(mapBoltRecordsToGraph([boltRecord]).nodes()[0].id).to.equal(1)
    expect(mapBoltRecordsToGraph([boltRecord]).nodes()[1].id).to.equal(2)
    expect(mapBoltRecordsToGraph([boltRecord]).relationships()[0].id).to.equal(3)
  })
})
