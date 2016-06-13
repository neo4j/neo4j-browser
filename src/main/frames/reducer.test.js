import {expect} from 'chai'
import frames from '.'

describe('frames reducer handling frames', () => {
  it('handles unknown action type', () => {
    const initialState = [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]
    const action = {
      type: 'UNKNOWN',
      state: {id: 3}
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal(initialState)
  })
  it('handles frames.actionTypes.ADD', () => {
    const initialState = {
      allIds: [1, 2, 3],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'Redux'},
        '3': {id: 3, data: 'Immutable'}
      }
    }
    const action = {
      type: frames.actionTypes.ADD,
      state: {id: 4, data: 'New Frame'}
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal({
      allIds: [1, 2, 3, 4],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'Redux'},
        '3': {id: 3, data: 'Immutable'},
        '4': {id: 4, data: 'New Frame'}
      }
    })
  })
  it('handles frames.actionTypes.ADD with existing id to replace', () => {
    const initialState = {
      allIds: [1, 2, 3],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'Redux'},
        '3': {id: 3, data: 'Immutable'}
      }
    }
    const action = {
      type: frames.actionTypes.ADD,
      state: {id: 2, data: 'New Frame'}
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal({
      allIds: [1, 2, 3],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'New Frame'},
        '3': {id: 3, data: 'Immutable'}
      }
    })
  })
  it('handles frames.actionTypes.REMOVE', () => {
    const initialState = {
      allIds: [1, 2, 3],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'Redux'},
        '3': {id: 3, data: 'Immutable'}
      }
    }
    const action = {
      type: frames.actionTypes.REMOVE,
      id: 3
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal({
      allIds: [1, 2],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'Redux'}
      }
    })
  })

  it('handles frames.actionTypes.CLEAR_ALL', () => {
    const initialState = {
      allIds: [1, 2, 3],
      byId: {
        '1': {id: 1, data: 'React'},
        '2': {id: 2, data: 'Redux'},
        '3': {id: 3, data: 'Immutable'}
      }
    }
    const action = {
      type: frames.actionTypes.CLEAR_ALL
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState.allIds).to.deep.equal([])
    expect(nextState.byId).to.deep.equal({})
  })
})
