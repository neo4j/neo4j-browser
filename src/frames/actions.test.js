import {expect} from 'chai'
import frames from '.'

describe('Frames actions', () => {
  it('should handle adding frames', () => {
    // Given
    const obj = {cmd: ':help', id: 1}
    const expected = { type: frames.actionTypes.ADD, state: obj }

    // When
    const actual = frames.actions.add(obj)

    // Then
    expect(actual).to.deep.equal(expected)
  })
})
