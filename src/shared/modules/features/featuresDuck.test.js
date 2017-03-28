/* global test, expect */
import reducer, { UPDATE } from './featuresDuck'

describe('features reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.cmdchar).toEqual(':')
  })

  test('handles UPDATE without initial state', () => {
    const action = {
      type: UPDATE,
      cc: true
    }
    const nextState = reducer(undefined, action)
    expect(nextState.cc).toEqual(true)
  })

  test('handles UPDATE', () => {
    const initialState = { cc: false, ha: false }
    const action = {
      type: UPDATE,
      ha: true
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual({
      cc: false,
      ha: true
    })
  })
})
