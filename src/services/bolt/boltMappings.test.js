import { expect } from 'chai'
import { itemIntToString, arrayIntToString, objIntToString } from './boltMappings'

describe('boltMappings', () => {
  describe('itemIntToString', () => {
    it('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {val: 'hello', checker: (_) => false, converter: (_) => false, expected: 'hello'},
        {val: ['hello'], checker: (_) => false, converter: (val) => false, expected: ['hello']},
        {val: null, checker: (_) => false, converter: (_) => false, expected: null},
        {val: {str: 'hello'}, checker: (_) => true, converter: (val) => {
          val.str = val.str.toUpperCase()
          return val
        }, expected: {str: 'HELLO'}}
      ]

      // When and Then
      tests.forEach((test) => {
        expect(itemIntToString(test.val, test.checker, test.converter)).to.deep.equal(test.expected)
      })
    })
  })
  describe('arrayIntToString', () => {
    it('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {val: ['hello', 1], checker: (_) => false, converter: (val) => false, expected: ['hello', 1]},
        {val: ['hello', ['ola', 'hi']], checker: (val) => typeof val === 'string', converter: (val) => val.toUpperCase(), expected: ['HELLO', ['OLA', 'HI']]},
        {val: ['hello', 1], checker: (val) => typeof val === 'string', converter: (val) => val.toUpperCase(), expected: ['HELLO', 1]}
      ]

      // When and Then
      tests.forEach((test) => {
        expect(arrayIntToString(test.val, test.checker, test.converter)).to.deep.equal(test.expected)
      })
    })
  })
  describe('objIntToString', () => {
    it('should convert matching values with provided function', () => {
      // Given
      const tests = [
        {val: {arr: ['hello']}, checker: (_) => false, converter: (val) => false, expected: {arr: ['hello']}},
        {val: {
          arr: ['hello', ['ola', 'hi']],
          str: 'hello',
          num: 2,
          obj: {
            num: 3,
            str: 'inner hello'
          }
        }, checker: (val) => typeof val === 'string', converter: (val) => val.toUpperCase(), expected: {
          arr: ['HELLO', ['OLA', 'HI']],
          str: 'HELLO',
          num: 2,
          obj: {
            num: 3,
            str: 'INNER HELLO'
          }
        }
      }]

      // When and Then
      tests.forEach((test) => {
        expect(objIntToString(test.val, test.checker, test.converter)).to.deep.equal(test.expected)
      })
    })
  })
})
