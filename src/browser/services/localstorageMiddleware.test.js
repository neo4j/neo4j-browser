/* global test, expect */
import { makeConnectionsInitialState, makeConnectionsPersistedState } from './localstorageMiddleware'

const connection = {
  reducer: (initialState, action) => {
    return {}
  }
}

describe('localstorageMiddleware', () => {
  test('makeConnectionsPersistedState should set activeConnection to offline', () => {
    // Given
    const before = {
      activeConnection: 'anything'
    }
    const key = 'connections'

    // When
    const after = makeConnectionsPersistedState()(key, before)

    // Then
    expect(after.activeConnection).toEqual('offline')
  })

  test('makeConnectionsInitialState should add offline connection', () => {
    // Given
    const before = {
      activeConnection: 'anything',
      allConnectionIds: ['x'],
      connectionsById: {'x': {name: 'x'}}
    }
    const key = 'connections'

    // When
    const after = makeConnectionsInitialState(connection.reducer)(key, before)

    // Then
    expect(after.activeConnection).toEqual('offline')
    expect(after.connectionsById['offline']).not.toBeUndefined()
    expect(after.connectionsById['offline'].name).toEqual('Offline')
    expect(after.connectionsById['x']).not.toBeUndefined()
  })
})
