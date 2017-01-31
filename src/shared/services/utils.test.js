/* global test, expect */
import * as utils from './utils'

describe('utils', () => {
  test('can deeply compare objects', () => {
    // Given
    const o1 = {a: 'a', b: 'b', c: {c: 'c'}}
    const o2 = {...o1}
    const o3 = {...o1, c: {c: 'd'}}

    // When & Then
    expect(utils.deepEquals(o1, o2)).toBeTruthy()
    expect(utils.deepEquals(o1, o3)).toBeFalsy()
  })
})
