import { expect } from 'chai'
import { put, call } from 'redux-saga/effects'
import { handleServerCommand, handleServerAddCommand, handleUseConnectionCommand } from './serverCommand'
import { UnknownCommandError } from '../../services/exceptions'
import bookmarks from '../../lib/containers/bookmarks'
import bolt from '../../services/bolt/bolt'

describe('serverCommandSagas', () => {
  describe('handleServerCommand Saga', () => {
    it('should call onError unknown commands', () => {
      // Given
      const payload = {cmd: ':unknown'}
      const storeSettings = {cmdchar: ':'}
      const onSuccess = () => {}
      const onError = () => {}
      const handleServerCommandSaga = handleServerCommand(payload, storeSettings.cmdchar, onSuccess, onError)

      // When
      const actualCallAction = handleServerCommandSaga.next().value
      const expectedCallAction = call(onError, {...payload, type: 'unknown'}, UnknownCommandError(payload.cmd))

      // Then
      expect(actualCallAction).to.deep.equal(expectedCallAction)
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
      const handleServerAddCommandSaga = handleServerAddCommand(payload, storeSettings.cmdchar)

      // When
      const actualPutAction = handleServerAddCommandSaga.next().value
      const expectedPutAction = put(bookmarks.actions.addServerBookmark(conf))

      // Then
      // Cannot deep equal because of uuid
      expect(actualPutAction.PUT.action.name).to.equal(expectedPutAction.PUT.action.name)
    })

    it('should handle :server use command for switching connection', () => {
      // Given
      const bookmarksState = {
        bookmarks: {
          allBookmarkIds: ['x'],
          bookmarksById: {
            'x': {
              name: 'myname',
              type: 'bolt'
            }
          }
        }
      }
      const connection = {name: 'myname'}
      const payload = {cmd: ':server use myname'}
      const handleUseConnectionSaga = handleUseConnectionCommand(payload, connection.name)

      // When
      handleUseConnectionSaga.next() // Get state
      const actualCallGetConnectionAction = handleUseConnectionSaga.next(bookmarksState).value
      const expectedCallGetConnectionAction = call(bolt.getConnection, connection.name)
      const actualCallUseConnectionAction = handleUseConnectionSaga.next(connection).value
      const expectedCallUseConnectionAction = call(bolt.useConnection, connection.name)

      // Then
      expect(actualCallGetConnectionAction).to.deep.equal(expectedCallGetConnectionAction)
      expect(actualCallUseConnectionAction).to.deep.equal(expectedCallUseConnectionAction)
    })
  })
})
