import { expect } from 'chai'
import helper from './commandInterpreterHelper'

describe('commandInterpreterHelper', () => {
  it('should recognize :clear command', () => {
    // Given
    const cmd = 'clear'
    const expectedCommandName = 'clear'

    // When
    const actualCommandName = helper.interpret(cmd).name

    // Then
    expect(actualCommandName).to.equal(expectedCommandName)
  })

  it('should find :config helper with params', () => {
    // Given
    const cmd = 'config cmdchar:"/"'
    const expectedCommandName = 'config'

    // When
    const actualCommandName = helper.interpret(cmd).name

    // Then
    expect(actualCommandName).to.equal(expectedCommandName)
  })

  it('should find :play helper with params', () => {
    // Given
    const cmd = 'play fileLocation'
    const expectedCommandName = 'play'

    // When
    const actualCommandName = helper.interpret(cmd).name

    // Then
    expect(actualCommandName).to.equal(expectedCommandName)
  })

  it('should give the "catch-all" match back whn unkown command', () => {
    // Given
    const cmd = 'nomatch'
    const expectedCommandName = 'catch-all'

    // When
    const actualCommandName = helper.interpret(cmd).name

    // Then
    expect(actualCommandName).to.equal(expectedCommandName)
  })
})
