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

describe('app reducer handling frames', () => {
  it('handles ADD_FRAME', () => {
    const initialState = {
      frames: [
        {id: 1, data: 'React'},
        {id: 2, data: 'Redux'},
        {id: 3, data: 'Immutable'}
      ]
    }
    const action = {
      type: 'ADD_FRAME',
      state: {id: 4, data: 'New Frame'}
    }
    const nextState = app(initialState, action)
    expect(nextState).to.deep.equal({frames: [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'},
      {id: 3, data: 'Immutable'},
      {id: 4, data: 'New Frame'}
    ]})
  })

  it('handles REMOVE_FRAME', () => {
    const initialState = {
      frames: [
        {id: 1, data: 'React'},
        {id: 2, data: 'Redux'},
        {id: 3, data: 'Immutable'}
      ]
    }
    const action = {
      type: 'REMOVE_FRAME',
      state: {id: 3}
    }
    const nextState = app(initialState, action)
    expect(nextState).to.deep.equal({frames: [
      {id: 1, data: 'React'},
      {id: 2, data: 'Redux'}
    ]})
  })
})
