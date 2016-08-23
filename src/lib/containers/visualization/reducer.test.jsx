import {expect} from 'chai'
import frames from '.'
import neo4jVisualization from 'neo4j-visualization'
import * as actions from './actions'

describe('visualization reducer', () => {
  it('should set initial state to be the stringified version of a new graphstyle', () => {
    const action = {
      type: 'UNKNOWN'
    }
    const nextState = frames.reducer(undefined, action)
    expect(nextState).to.deep.equal(neo4jVisualization.neoGraphStyle().toString())
  })
  it('should update state to be the graphstyle data provided in the action', () => {
    const data =
    `node {
      diameter: 50px;
      color: #A5ABB6;
      border-color: #9AA1AC;
      border-width: 2px;
      text-color-internal: #FFFFFF;
      font-size: 10px;
    }
    relationship {
      color: #A5ABB6;
      shaft-width: 1px;
      font-size: 8px;
      padding: 3px;
      text-color-external: #000000;
      text-color-internal: #FFFFFF;
      caption: '<type>';
    }

    node.Person {
      color: #68BDF6;
      border-color: #5CA8DB;
      text-color-internal: #FFFFFF;
      caption: '{name}';
    }

    node.Movie {
      color: #6DCE9E;
      border-color: #60B58B;
      text-color-internal: #FFFFFF;
      caption: '{title}';
  }`
    const action = actions.updateGraphStyleData(data)
    const nextState = frames.reducer(undefined, action)
    expect(nextState).to.deep.equal(data)
  })
  it('should update reset state to be the stringified version of a new graphstyle', () => {
    const action = actions.resetGraphStyleData()
    const nextState = frames.reducer({stuff: 'somedata'}, action)
    expect(nextState).to.deep.equal(neo4jVisualization.neoGraphStyle().toString())
  })
})
