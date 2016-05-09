import { expect } from 'chai'
import { put, take } from 'redux-saga/effects'
import { addFrame } from '../../src/action_creators.js'

import { watchCommands } from '../../src/sagas/commandInterpreter'

describe('commandInterpreter Saga', () => {
  it('should listen to USER_COMMAND_QUEUED and create a frame from that', () => {
    // Given
    const watchSaga = watchCommands()
    const payload = {cmd: 'hi'}
    const settings = {cmdchar: ':'}

    // When
    watchSaga.next() // Trigger settings read
    const rec = watchSaga.next().value
    watchSaga.next(payload) // Settings read again
    const actualPutAction = watchSaga.next(settings).value
    const expectedPutAction = put(addFrame(payload.cmd))

    // Then
    expect(rec).to.deep.equal(take('USER_COMMAND_QUEUED'))
    // We cannot do deep equal here because of uuid
    expect(actualPutAction.PUT.action.state.cmd).to.equal(expectedPutAction.PUT.action.state.cmd)
  })
})
