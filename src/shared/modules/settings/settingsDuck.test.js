import {expect} from 'chai'
import reducer, { UPDATE } from './settingsDuck'

describe('settings reducer', () => {
  it('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.cmdchar).to.equal(':')
  })

  it('handles UPDATE without initial state', () => {
    const action = {
      type: UPDATE,
      state: {
        greeting: 'hello'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.greeting).to.equal('hello')
  })

  it('handles UPDATE', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState).to.deep.equal({
      cmdchar: ':',
      greeting: 'woff',
      type: 'dog'
    })
  })
})
