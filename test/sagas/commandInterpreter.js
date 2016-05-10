import { expect } from 'chai'
import { put, take, call } from 'redux-saga/effects'
import { addFrame } from '../../src/action_creators.js'
import { watchCommands } from '../../src/sagas/commandInterpreter'
import bolt from '../../src/services/bolt'

describe('commandInterpreter Saga', () => {
  it('should listen to USER_COMMAND_QUEUED starting with :', () => {
    // Given
    const watchSaga = watchCommands()
    const payload = {cmd: ':help'}
    const settings = {cmdchar: ':'}

    // When
    watchSaga.next() // Trigger settings read
    const rec = watchSaga.next().value
    watchSaga.next(payload) // Settings read again
    const actualPutAction = watchSaga.next(settings).value
    const expectedPutAction = put(addFrame({cmd: payload.cmd}))

    // Then
    expect(rec).to.deep.equal(take('USER_COMMAND_QUEUED'))
    // We cannot do deep equal here because of uuid
    expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
  })

  it('should listen to USER_COMMAND_QUEUED with Cypher', () => {
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
    const expectedPutAction = put(addFrame({cmd: payload.cmd}))

    // Then
    expect(rec).to.deep.equal(take('USER_COMMAND_QUEUED'))
    expect(actualBoltAction).to.deep.equal(expectedBoltAction)
    // We cannot do deep equal here because of uuid
    expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
  })
})
