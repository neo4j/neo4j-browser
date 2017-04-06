/* global test, expect */
import reducer, { UPDATE_LABELS, UPDATE_GRAPH_STYLE_DATA } from './visualizationDuck'

describe('visualization reducer', () => {
  test('handles initial value', () => {
    const nextState = reducer(undefined, {type: ''})
    expect(nextState.labels).toHaveLength(0)
    expect(nextState.styleData).toBeNull()
  })

  test('handles UPDATE_LABELS without initial state', () => {
    const action = {
      type: UPDATE_LABELS,
      labels: ['Person']
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels[0]).toEqual('Person')
    expect(nextState.styleData).toBeNull()
  })

  test('handles UPDATE_LABELS', () => {
    const initialState = { labels: ['Person'], styleData: 'style' }
    const action = {
      type: UPDATE_LABELS,
      labels: ['Movie']
    }
    const nextState = reducer(initialState, action)
    expect(nextState.labels[0]).toEqual('Movie')
    expect(nextState.labels).toHaveLength(1)
    expect(nextState.styleData).toEqual('style')
  })

  test('handles UPDATE_GRAPH_STYLE_DATA without initial state', () => {
    const action = {
      type: UPDATE_GRAPH_STYLE_DATA,
      styleData: 'style updated'
    }
    const nextState = reducer(undefined, action)
    expect(nextState.labels).toHaveLength(0)
    expect(nextState.styleData).toEqual('style updated')
  })

  test('handles UPDATE_GRAPH_STYLE_DATA', () => {
    const initialState = { labels: ['Person'], styleData: 'style' }
    const action = {
      type: UPDATE_GRAPH_STYLE_DATA,
      styleData: 'style updated again'
    }
    const nextState = reducer(initialState, action)
    expect(nextState.labels[0]).toEqual('Person')
    expect(nextState.labels).toHaveLength(1)
    expect(nextState.styleData).toEqual('style updated again')
  })
})
