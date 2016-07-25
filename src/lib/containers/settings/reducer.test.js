import {expect} from 'chai'
import settings from '.'

describe('settings reducer', () => {
  it('handles initial value', () => {
    const nextState = settings.reducer(undefined, {type: ''})
    expect(nextState.cmdchar).to.equal(':')
  })

  it('handles settings.actionTypes.UPDATE without initial state', () => {
    const action = {
      type: settings.actionTypes.UPDATE,
      state: {
        greeting: 'hello'
      }
    }
    const nextState = settings.reducer(undefined, action)
    expect(nextState.greeting).to.equal('hello')
  })

  it('handles settings.actionTypes.UPDATE', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: settings.actionTypes.UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = settings.reducer(initialState, action)
    expect(nextState).to.deep.equal({
      cmdchar: ':',
      greeting: 'woff',
      type: 'dog'
    })
  })
})
