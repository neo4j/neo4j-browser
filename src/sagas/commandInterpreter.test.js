import { expect } from 'chai'
import { put, take, call } from 'redux-saga/effects'
import frames from '../frames'
import editor from '../editor'
import { watchCommands, handleClientCommand } from './commandInterpreter'
import bolt from '../services/bolt'

describe('watchCommands Saga', () => {
  it('should listen to editor.actionTypes.USER_COMMAND_QUEUED starting with :', () => {
    // Given
    const watchSaga = watchCommands()
    const payload = {cmd: ':help'}
    const settings = {cmdchar: ':'}

    // When
    watchSaga.next() // Trigger settings read
    const rec = watchSaga.next().value
    watchSaga.next(payload) // Settings read again
    const actualCallAction = watchSaga.next(settings).value
    const expectedCallAction = call(handleClientCommand, settings.cmdchar, payload.cmd)

    // Then
    expect(rec).to.deep.equal(take(editor.actionTypes.USER_COMMAND_QUEUED))
    expect(actualCallAction).to.deep.equal(expectedCallAction)
  })

  it('should listen to editor.actionTypes.USER_COMMAND_QUEUED with Cypher', () => {
    // Given
    const watchSaga = watchCommands()
    const payload = {cmd: 'RETURN 1'}
    const settings = {cmdchar: ':'}

    // When
    watchSaga.next() // Trigger settings read
    const rec = watchSaga.next().value
    watchSaga.next(payload) // Settings read again
    const actualBoltAction = watchSaga.next(settings).value
    const expectedBoltAction = call(bolt.transaction, payload.cmd)
    const actualPutAction = watchSaga.next().value
    const expectedPutAction = put(frames.actions.add({cmd: payload.cmd}))

    // Then
    expect(rec).to.deep.equal(take(editor.actionTypes.USER_COMMAND_QUEUED))
    expect(actualBoltAction).to.deep.equal(expectedBoltAction)
    // We cannot do deep equal here because of uuid
    expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
  })
})

describe('handleClientCommand Saga', () => {
  it('should create default frame for unknown commands', () => {
    // Given
    const payload = {cmd: ':unknown'}
    const settings = {cmdchar: ':'}
    const handleClientCommandSaga = handleClientCommand(settings.cmdchar, payload.cmd)

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
    const settings = {cmdchar: ':'}
    const handleClientCommandSaga = handleClientCommand(settings.cmdchar, payload.cmd)

    // When
    const actualPutAction = handleClientCommandSaga.next().value
    const expectedPutAction = put(frames.actions.clear())

    // Then
    expect(actualPutAction).to.deep.equal(expectedPutAction)
  })
})
