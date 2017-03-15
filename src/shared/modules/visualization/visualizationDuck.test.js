/* global test, expect */
import reducer, { UPDATE } from './visualizationDuck'

describe('visualization reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.labels).toHaveLength(0)
  })

  test('handles UPDATE without initial state', () => {
    const action = {
      type: UPDATE,
      state: {
        labels: ['Person']
      }
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels[0]).toEqual('Person')
  })

  test('handles UPDATE', () => {
    const initialState = { labels: ['Person'] }
    const action = {
      type: UPDATE,
      state: {
        labels: ['Movie']
      }
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual({
      labels: ['Movie']
    })
  })
})
