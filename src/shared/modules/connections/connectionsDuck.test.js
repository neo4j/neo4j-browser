import {expect} from 'chai'
import reducer, * as connections from '.'

describe('connections reducer', () => {
  it('handles connections.ADD', () => {
    const action = {
      type: connections.ADD,
      connection: {
        id: 'x',
        name: 'bm'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.allConnectionIds).to.deep.equal(['x'])
    expect(nextState.connectionsById).to.deep.equal({'x': {
      id: 'x',
      name: 'bm'
    }})
  })

  it('handles connections.SET_ACTIVE', () => {
    const initialState = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: connections.SET_ACTIVE,
      connectionId: 2
    }
    const nextState = reducer(initialState, action)
    expect(nextState.activeConnection).to.equal(2)
  })
})
