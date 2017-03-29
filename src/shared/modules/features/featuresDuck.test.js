/* global test, expect */
import reducer, { UPDATE_ALL } from './featuresDuck'

describe('features reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState).toEqual({availableProcedures: []})
  })

  test('handles UPDATE_ALL without initial state', () => {
    const action = {
      type: UPDATE_ALL,
      availableProcedures: ['proc']
    }
    const nextState = reducer(undefined, action)
    expect(nextState.availableProcedures).toEqual(['proc'])
  })

  test('handles UPDATE_ALL', () => {
    const initialState = { availableProcedures: ['a', 'b'] }
    const action = {
      type: UPDATE_ALL,
      availableProcedures: ['c']
    }
    const nextState = reducer(initialState, action)
    expect(nextState.availableProcedures).toEqual(['a', 'b', 'c'])
  })
})
