/* global describe, test, expect */

import reducer, * as params from './paramsDuck'

describe('paramsDuck', () => {
  test('Finds the reducer', () => {
    expect(reducer).not.toEqual({})
  })

  test('Can add a param to empty state', () => {
    // Given
    const state = {}
    const param = {x: 1}
    const action = params.merge(param)

    // When
    const next = reducer(state, action)

    // Then
    expect(next).toEqual(param)
  })

  test('Can add a param to non-empty state', () => {
    // Given
    const state = {y: 2}
    const param = {x: 1}
    const expected = {...state, ...param}
    const action = params.merge(param)

    // When
    const next = reducer(state, action)

    // Then
    expect(next).toEqual(expected)
  })

  test('Can overwrite a param to non-empty state', () => {
    // Given
    const state = {y: 2}
    const param = {y: 1}
    const action = params.merge(param)

    // When
    const next = reducer(state, action)

    // Then
    expect(next).toEqual(param)
  })
})
