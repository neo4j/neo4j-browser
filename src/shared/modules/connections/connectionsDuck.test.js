/* global test, expect */

import reducer, * as connections from './connectionsDuck'

describe('connections reducer', () => {
  test('handles connections.ADD', () => {
    const action = {
      type: connections.ADD,
      connection: {
        id: 'x',
        name: 'bm'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.allConnectionIds).toEqual(['x'])
    expect(nextState.connectionsById).toEqual({'x': {
      id: 'x',
      name: 'bm'
    }})
  })

  test('handles connections.SET_ACTIVE', () => {
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
    expect(nextState.activeConnection).toEqual(2)
  })

  test('handles connections.REMOVE', () => {
    const initialState = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: connections.REMOVE,
      connectionId: 2
    }
    const nextState = reducer(initialState, action)
    expect(nextState.allConnectionIds).toEqual([1, 3])
    expect(Object.keys(nextState.connectionsById)).toEqual(['1', '3'])
  })

  test('handles connections.UPDATE', () => {
    const initialState = {
      allConnectionIds: [1, 2, 3],
      connectionsById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: connections.UPDATE,
      connection: {
        id: '1',
        name: 'bm1',
        username: 'new user',
        password: 'different password'
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState.allConnectionIds).toEqual([1, 2, 3])
    expect(nextState.connectionsById['1']).toEqual({id: '1', name: 'bm1', username: 'new user', password: 'different password'})
  })
})
