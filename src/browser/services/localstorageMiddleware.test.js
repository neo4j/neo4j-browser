import { expect } from 'chai'
import { makeConnectionsInitialState, makeConnectionsPersistedState } from './localstorageMiddleware'

const connection = {
  reducer: (initialState, action) => {
    return {}
  }
}

describe('localstorageMiddleware', () => {
  it('makeConnectionsPersistedState should set activeConnection to offline', () => {
    // Given
    const before = {
      activeConnection: 'anything'
    }
    const key = 'connections'

    // When
    const after = makeConnectionsPersistedState()(key, before)

    // Then
    expect(after.activeConnection).to.equal('offline')
  })

  it('makeConnectionsInitialState should add offline connection', () => {
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
    expect(after.activeConnection).to.equal('offline')
    expect(after.connectionsById['offline']).not.to.be.undefined
    expect(after.connectionsById['offline'].name).to.equal('Offline')
    expect(after.connectionsById['x']).not.to.be.undefined
  })
})
