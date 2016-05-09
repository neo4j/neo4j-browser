import {expect} from 'chai'
import {frames} from '../../src/reducers'

describe('frames reducer handling frames', () => {
  it('handles ADD_FRAME', () => {
    const initialState = [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]
    const action = {
      type: 'ADD_FRAME',
      state: {id: 4, data: 'New Frame'}
    }
    const nextState = frames(initialState, action)
    expect(nextState).to.deep.equal([
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'},
      {id: 4, data: 'New Frame'}
    ])
  })

  it('handles REMOVE_FRAME', () => {
    const initialState = [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]
    const action = {
      type: 'REMOVE_FRAME',
      state: {id: 3}
    }
    const nextState = frames(initialState, action)
    expect(nextState).to.deep.equal([
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'}
    ])
  })
})
