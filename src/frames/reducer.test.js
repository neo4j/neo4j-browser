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
    const initialState = [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]
    const action = {
      type: frames.actionTypes.ADD,
      state: {id: 4, data: 'New Frame'}
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal([
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'},
      {id: 4, data: 'New Frame'}
    ])
  })

  it('handles frames.actionTypes.REMOVE', () => {
    const initialState = [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]
    const action = {
      type: frames.actionTypes.REMOVE,
      state: {id: 3}
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal([
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'}
    ])
  })

  it('handles frames.actionTypes.CLEAR_ALL', () => {
    const initialState = [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]
    const action = {
      type: frames.actionTypes.CLEAR_ALL
    }
    const nextState = frames.reducer(initialState, action)
    expect(nextState).to.deep.equal([])
  })
})
