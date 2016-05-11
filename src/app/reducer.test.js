import {expect} from 'chai'
import app from '.'

describe('app reducer app.actionTypes.SET_STATE', () => {
  it('handles app.actionTypes.SET_STATE with plain JS payload', () => {
    const initialState = {}
    const action = {
      type: app.actionTypes.SET_STATE,
      state: {
        frames: [
          {id: 1, data: 'React'},
          {id: 2, data: 'Redux'},
          {id: 3, data: 'Immutable'}
        ]
      }
    }
    const nextState = app.reducer(initialState, action)
    expect(nextState).to.deep.equal({frames: [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]})
  })

  it('handles app.actionTypes.SET_STATE without initial state', () => {
    const action = {
      type: app.actionTypes.SET_STATE,
      state: {
        frames: [
          {id: 1, data: 'React'},
          {id: 2, data: 'Redux'},
          {id: 3, data: 'Immutable'}
        ]
      }
    }
    const nextState = app.reducer(undefined, action)
    expect(nextState).to.deep.equal({frames: [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'}
    ]})
  })
})
