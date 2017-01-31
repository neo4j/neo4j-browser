/* global test, expect */
import helper from './commandInterpreterHelper'

describe('commandInterpreterHelper', () => {
  describe('discover commands', () => {
    test('should recognize :clear command', () => {
      // Given
      const cmd = 'clear'
      const expectedCommandName = 'clear'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should find :config helper with params', () => {
      // Given
      const cmd = 'config cmdchar:"/"'
      const expectedCommandName = 'config'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should find :play helper with params', () => {
      // Given
      const cmd = 'play fileLocation'
      const expectedCommandName = 'play'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should find :play `url` helper with params', () => {
      // Given
      const cmd = 'play http://neo4j.com'
      const expectedCommandName = 'play-remote'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })

    test('should give the "catch-all" match back whn unkown command', () => {
      // Given
      const cmd = 'nomatch'
      const expectedCommandName = 'catch-all'

      // When
      const actualCommandName = helper.interpret(cmd).name

      // Then
      expect(actualCommandName).toEqual(expectedCommandName)
    })
  })
})
