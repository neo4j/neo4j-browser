import {expect} from 'chai'
import {settings} from '../../src/reducers'

describe('settings reducer', () => {
  it('handles initial value', () => {
    const nextState = settings(undefined, {type: ''})
    expect(nextState.cmdchar).to.equal(':')
  })

  it('handles UPDATE_SETTINGS without initial state', () => {
    const action = {
      type: 'UPDATE_SETTINGS',
      state: {
        greeting: 'hello'
      }
    }
    const nextState = settings(undefined, action)
    expect(nextState.greeting).to.equal('hello')
  })

  it('handles UPDATE_SETTINGS', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: 'UPDATE_SETTINGS',
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = settings(initialState, action)
    expect(nextState).to.deep.equal({
      cmdchar: ':',
      greeting: 'woff',
      type: 'dog'
    })
  })
})
