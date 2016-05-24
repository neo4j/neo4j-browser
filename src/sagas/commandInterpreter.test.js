import { expect } from 'chai'
import { put, take, call } from 'redux-saga/effects'
import frames from '../main/frames'
import editor from '../main/editor'
import { watchCommands, handleClientCommand, handleServerCommand } from './commandInterpreter'
import bolt from '../services/bolt'
import remote from '../services/remote'
import settings from '../settings'

describe('commandInterpreter Sagas', () => {
  describe('watchCommands Saga', () => {
    it('should listen to editor.actionTypes.USER_COMMAND_QUEUED starting with :', () => {
      // Given
      const watchSaga = watchCommands()
      const payload = {cmd: ':help'}
      const storeSettings = {cmdchar: ':'}

      // When
      const rec = watchSaga.next().value
      const actualHistoryPut = watchSaga.next(payload).value
      const expectedHistoryPut = put(editor.actions.addHistory(payload))
      watchSaga.next() // Settings read
      const actualCallAction = watchSaga.next(storeSettings).value
      const expectedCallAction = call(handleClientCommand, payload.cmd, storeSettings.cmdchar)

      // Then
      expect(rec).to.deep.equal(take(editor.actionTypes.USER_COMMAND_QUEUED))
      expect(actualHistoryPut).to.deep.equal(expectedHistoryPut)
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })

    it('should listen to editor.actionTypes.USER_COMMAND_QUEUED with Cypher', () => {
      // Given
      const watchSaga = watchCommands()
      const payload = {cmd: 'RETURN 1'}
      const storeSettings = {cmdchar: ':'}

      // When
      const rec = watchSaga.next().value
      const actualHistoryPut = watchSaga.next(payload).value
      const expectedHistoryPut = put(editor.actions.addHistory(payload))
      watchSaga.next() // Settings read
      const actualBoltAction = watchSaga.next(storeSettings).value
      const expectedBoltAction = call(bolt.transaction, payload.cmd)
      const actualPutAction = watchSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd}))

      // Then
      expect(rec).to.deep.equal(take(editor.actionTypes.USER_COMMAND_QUEUED))
      expect(actualHistoryPut).to.deep.equal(expectedHistoryPut)
      expect(actualBoltAction).to.deep.equal(expectedBoltAction)
      // We cannot do deep equal here because of uuid
      expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
    })
  })

  describe('handleClientCommand Saga', () => {
    it('should create default frame for unknown commands', () => {
      // Given
      const payload = {cmd: ':unknown'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualPutAction = handleClientCommandSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd}))

      // Then
      // We cannot do deep equal here because of uuid
      expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
    })

    it('should put action frames.action.clear on :clear command', () => {
      // Given
      const payload = {cmd: ':clear'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualPutAction = handleClientCommandSaga.next().value
      const expectedPutAction = put(frames.actions.clear())

      // Then
      expect(actualPutAction).to.deep.equal(expectedPutAction)
    })

    it('should put action frames.action.add on :play command', () => {
      // Given
      const payload = {cmd: ':play a', type: 'play'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualPutAction = handleClientCommandSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd, type: payload.type}))
      // Then
      expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
      expect(actualPutAction.PUT.action.state.type).to.equal(expectedPutAction.PUT.action.state.type)
    })

    it('should put action frames.action.add on :play `url` command', () => {
      const url = 'http://test.test'

      // Given
      const payload = {cmd: ':play ' + url, type: 'play-remote'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualBoltAction = handleClientCommandSaga.next('http://test.test').value
      const expectedBoltAction = call(remote.get, 'http://test.test')

      // Then
      expect(actualBoltAction).to.deep.equal(expectedBoltAction)

      // When
      const actualPutAction = handleClientCommandSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd, type: payload.type}))

      // Then
      expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
      expect(actualPutAction.PUT.action.state.type).to.equal(expectedPutAction.PUT.action.state.type)
    })
  })

  describe('handleServerCommand Saga', () => {
    it('should create unknown frame for unknown commands', () => {
      // Given
      const payload = {cmd: ':unknown'}
      const storeSettings = {cmdchar: ':'}
      const handleServerCommandSaga = handleServerCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualPutAction = handleServerCommandSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd, type: 'unknown'}))

      // Then
      // We cannot do deep equal here because of uuid
      expect(actualPutAction.PUT.action.state.type).to.equal(expectedPutAction.PUT.action.state.type)
    })

    it('should include errors on wrong :server add command format', () => {
      // Given
      const payload = {cmd: ':server add user:pass@server:8585'} // missing name
      const storeSettings = {cmdchar: ':'}
      const handleServerCommandSaga = handleServerCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualPutAction = handleServerCommandSaga.next().value
      const expectedPutAction = put(frames.actions.add({cmd: payload.cmd, errors: {}, type: 'cmd'}))

      // Then
      // We cannot do deep equal here because of uuid
      expect(actualPutAction.PUT.action.state.cmd).to.deep.equal(expectedPutAction.PUT.action.state.cmd)
      expect(actualPutAction.PUT.action.state.errors).to.not.be.undefined
    })

    it('should handle :server add command for adding server bookmarks', () => {
      // Given
      const conf = {
        name: 'myname',
        username: 'user',
        password: 'pass',
        host: 'server:7687'
      }
      const payload = {cmd: `:server add ${conf.name} ${conf.username}:${conf.password}@${conf.host}`}
      const storeSettings = {cmdchar: ':'}
      const handleServerCommandSaga = handleServerCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualPutAction = handleServerCommandSaga.next().value
      const expectedPutAction = put(settings.actions.addServerBookmark(conf))

      // Then
      expect(actualPutAction).to.deep.equal(expectedPutAction)
    })
  })
})
