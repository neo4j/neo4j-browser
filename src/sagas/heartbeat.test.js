import { expect } from 'chai'
import { call, put } from 'redux-saga/effects'
import { startHeartbeat, metaQuery } from './heartbeat'
import dbInfo from '../sidebar/dbInfo'
import bolt from '../services/bolt/bolt'

describe('heartbeat Saga', () => {
  it('should call bolt to get metadata', () => {
    // Given
    const heartbeat = startHeartbeat()

    // When
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
    heartbeat.next().value
    const actualPutAction = heartbeat.next(metadata).value
    const expectedPutAction = put(dbInfo.actions.updateMeta(metadata))

    // Then
    expect(actualPutAction).to.deep.equal(expectedPutAction)
  })
})
