import { expect } from 'chai'
import { call, put } from 'redux-saga/effects'
import { startHeartbeat, metaQuery } from './heartbeatSaga'
import { updateMeta } from './actions'
import bolt from 'services/bolt/bolt'

describe('heartbeat Saga', () => {
  it('should call bolt to get metadata', () => {
    // Given
    const heartbeat = startHeartbeat()

    // When
    heartbeat.next() // Get context
    const actualCallAction = heartbeat.next().value
    const expectedCallAction = call(bolt.transaction, metaQuery)

    // Then
    expect(actualCallAction).to.deep.equal(expectedCallAction)
  })

  it('should dispach event updating metadata', () => {
    // Given
    const heartbeat = startHeartbeat()

    // When
    const metadata = 'meta stuff'
    heartbeat.next() // Get context
    heartbeat.next()
    const actualPutAction = heartbeat.next(metadata).value
    const expectedPutAction = put(updateMeta(metadata))

    // Then
    expect(actualPutAction).to.deep.equal(expectedPutAction)
  })
})
