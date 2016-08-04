import { expect } from 'chai'
import remote from '../services/remote'
import { put, call } from 'redux-saga/effects'
import frames from '../lib/containers/frames'
import helper from './commandInterpreterHelper'

describe('commandInterpreterHelper', () => {
  describe('discover commands', () => {
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

    it('should find :play `url` helper with params', () => {
      // Given
      const cmd = 'play http://neo4j.com'
      const expectedCommandName = 'play-remote'

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

  describe('commands execution', () => {
    it('should put action frames.action.clear on :clear command', () => {
      // Given
      const payload = {cmd: ':clear'}
      const storeSettings = {cmdchar: ':'}
      const interpreted = helper.interpret(payload.cmd.substr(storeSettings.cmdchar.length))
      const handleClientCommandSaga = interpreted.exec(payload, storeSettings.cmdchar)

      // When
      const actualPutAction = handleClientCommandSaga.next().value
      const expectedPutAction = put(frames.actions.clear())

      // Then
      expect(actualPutAction).to.deep.equal(expectedPutAction)
    })

    it('should call onSuccess callback on :play command', () => {
      // Given
      const payload = {cmd: ':play a', type: 'play'}
      const storeSettings = {cmdchar: ':'}
      const onSuccess = () => {}
      const interpreted = helper.interpret(payload.cmd.substr(storeSettings.cmdchar.length))
      const handleClientCommandSaga = interpreted.exec(payload, storeSettings.cmdchar, onSuccess)

      // When
      const actualCallAction = handleClientCommandSaga.next().value
      const expectedCallAction = call(onSuccess, {cmd: payload.cmd, type: payload.type})

      // Then
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })

    it('should put action frames.action.add on :play `url` command', () => {
      // Given
      const url = 'http://test.test'
      const payload = {cmd: ':play ' + url, type: 'play-remote'}
      const storeSettings = {cmdchar: ':'}
      const interpreted = helper.interpret(payload.cmd.substr(storeSettings.cmdchar.length))
      const handleClientCommandSaga = interpreted.exec(payload, storeSettings.cmdchar)

      // When
      const actualRemoteGetAction = handleClientCommandSaga.next('http://test.test').value
      const expectedRemoteGetAction = call(remote.get, 'http://test.test')

      // Then
      expect(actualRemoteGetAction).to.deep.equal(expectedRemoteGetAction)
    })
  })
})
