import {expect} from 'chai'
import {app} from '../../src/reducers'

describe('app reducer SET_STATE', () => {
  it('handles SET_STATE with plain JS payload', () => {
    const initialState = {}
    const action = {
      type: 'SET_STATE',
      state: {
        frames: [
          {id: 1, data: 'React'},
          {id: 2, data: 'Redux'},
          {id: 3, data: 'Immutable'}
        ]
      }
    }
    const nextState = app(initialState, action)
    expect(nextState).to.deep.equal({frames: [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]})
  })

  it('handles SET_STATE without initial state', () => {
    const action = {
      type: 'SET_STATE',
      state: {
        frames: [
          {id: 1, data: 'React'},
          {id: 2, data: 'Redux'},
          {id: 3, data: 'Immutable'}
        ]
      }
    }
    const nextState = app(undefined, action)
    expect(nextState).to.deep.equal({frames: [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]})
  })
})
