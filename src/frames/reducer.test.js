import {expect} from 'chai'
import frames from '.'

describe('frames reducer handling frames', () => {
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

  it('handles rames.actionTypes.REMOVE', () => {
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
})
