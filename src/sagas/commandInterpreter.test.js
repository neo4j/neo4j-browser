import { expect } from 'chai'
import { put, call } from 'redux-saga/effects'
import editor from '../lib/containers/editor'
import { handleCommand, handleClientCommand } from './commandInterpreter'
import helper from '../services/commandInterpreterHelper'
import bolt from '../services/bolt/bolt'

describe('commandInterpreter Sagas', () => {
  describe('handleCommand Saga', () => {
    it('should listen to editor.actionTypes.USER_COMMAND_QUEUED starting with :', () => {
      // Given
      const onSuccess = () => {}
      const onError = () => {}
      const payload = {
        cmd: ':help',
        type: editor.actionTypes.USER_COMMAND_QUEUED,
        onSuccess,
        onError
      }
      const handleSaga = handleCommand(payload)
      const storeSettings = {cmdchar: ':'}

      // When
      const actualHistoryPut = handleSaga.next().value
      const expectedHistoryPut = put(editor.actions.addHistory({cmd: payload.cmd}))
      handleSaga.next() // Settings read
      const actualCallAction = handleSaga.next(storeSettings).value
      const expectedCallAction = call(handleClientCommand, payload, storeSettings.cmdchar, onSuccess, onError)

      // Then
      expect(actualHistoryPut).to.deep.equal(expectedHistoryPut)
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })

    it('should listen to editor.actionTypes.USER_COMMAND_QUEUED with Cypher', () => {
      // Given
      const onSuccess = () => {}
      const onError = () => {}
      const payload = {
        cmd: 'RETURN 1',
        type: editor.actionTypes.USER_COMMAND_QUEUED,
        bookmarkId: 'x',
        onSuccess,
        onError
      }
      const connection = {transaction: () => {}}
      const result = 'hello'
      const handleSaga = handleCommand(payload)
      const storeSettings = {cmdchar: ':'}

      // When
      const actualHistoryPut = handleSaga.next(payload).value
      const expectedHistoryPut = put(editor.actions.addHistory({cmd: payload.cmd}))
      handleSaga.next() // Settings read
      const actualGetConnection = handleSaga.next(storeSettings).value // Pass settings
      const expectedGetConnection = call(bolt.getConnection, payload.bookmarkId)
      const actualQueryAction = handleSaga.next(connection).value // Pass connection
      const expectedQueryAction = call(connection.transaction, payload.cmd)
      const actualSuccess = handleSaga.next(result).value // Pass result
      const expectedSuccess = call(onSuccess, {...payload, type: 'cypher'}, result)

      // Then
      expect(actualHistoryPut).to.deep.equal(expectedHistoryPut)
      expect(actualGetConnection).to.deep.equal(expectedGetConnection)
      expect(actualQueryAction).to.deep.equal(expectedQueryAction)
      expect(actualSuccess).to.deep.equal(expectedSuccess)
    })
  })

  describe('handleClientCommand Saga', () => {
    it('should catch unknown commands', () => {
      // Given
      const onSuccess = () => {}
      const onError = () => {}
      const payload = {cmd: ':unknown'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload, storeSettings.cmdchar, onSuccess, onError)

      // When
      const actualCallAction = handleClientCommandSaga.next().value
      const expectedCallAction = call(helper.interpret('catch-all').exec, payload, storeSettings.cmdchar, onSuccess, onError)

      // Then
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })

    it('should find known commands', () => {
      // Given
      const onSuccess = () => {}
      const onError = () => {}
      const payload = {cmd: ':clear'}
      const storeSettings = {cmdchar: ':'}
      const handleClientCommandSaga = handleClientCommand(payload, storeSettings.cmdchar, onSuccess, onError)

      // When
      const actualCallAction = handleClientCommandSaga.next().value
      const expectedCallAction = call(helper.interpret('clear').exec, payload, storeSettings.cmdchar, onSuccess, onError)

      // Then
      expect(actualCallAction).to.deep.equal(expectedCallAction)
    })
  })
})
