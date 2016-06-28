import chai from 'chai'
import {createGraph} from './mapper'

const expect = chai.expect

describe('mapper', () => {
  it('should map nodes and relationships to neo graph object', () => {
    let startNode = { id: '1', labels: ['Person'], properties: {} }
    let endNode = { id: '2', labels: ['Movies'], properties: {} }
    let relationship = { id: '3', startNodeId: '1', endNodeId: '2', type: 'ACTED_IN', properties: {} }
    let graph = createGraph([startNode, endNode], [relationship])
    let graphNodes = graph.nodes()
    let graphRels = graph.relationships()
    expect(graphNodes).to.have.lengthOf(2)
    expect(graphRels).to.have.lengthOf(1)
    expect(graphRels[0].source).to.equal(graphNodes[0])
    expect(graphRels[0].target).to.equal(graphNodes[1])
  })
})
