/* global test, expect */
import reducer, { UPDATE } from './settingsDuck'

describe('settings reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.cmdchar).toEqual(':')
  })

  test('handles UPDATE without initial state', () => {
    const action = {
      type: UPDATE,
      state: {
        greeting: 'hello'
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.greeting).toEqual('hello')
  })

  test('handles UPDATE', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual({
      cmdchar: ':',
      greeting: 'woff',
      type: 'dog'
    })
  })
})
