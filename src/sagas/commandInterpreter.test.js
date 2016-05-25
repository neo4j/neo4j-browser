import { expect } from 'chai'
import { put, take, call } from 'redux-saga/effects'
import frames from '../main/frames'
import editor from '../main/editor'
import { watchCommands, handleClientCommand } from './commandInterpreter'
import bolt from '../services/bolt/bolt'
import remote from '../services/remote'

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
      // Given
      const url = 'http://test.test'
      const payload = {cmd: ':play ' + url, type: 'play-remote'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload.cmd, storeSettings.cmdchar)

      // When
      const actualRemoteGetAction = handleClientCommandSaga.next('http://test.test').value
      const expectedRemoteGetAction = call(remote.get, 'http://test.test')

      // Then
      expect(actualRemoteGetAction).to.deep.equal(expectedRemoteGetAction)
    })
  })
})
