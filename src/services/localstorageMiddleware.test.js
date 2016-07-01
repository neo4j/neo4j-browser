import { expect } from 'chai'
import { makeBookmarksInitialState, makeBookmarksPersistedState } from './localstorageMiddleware'

const bookmarks = {
  reducer: (initialState, action) => {
    return {}
  }
}

describe('localstorageMiddleware', () => {
  it('makeBookmarksPersistedState should set activeBookmark to offline', () => {
    // Given
    const before = {
      activeBookmark: 'anything'
    }
    const key = 'bookmarks'

    // When
    const after = makeBookmarksPersistedState()(key, before)

    // Then
    expect(after.activeBookmark).to.equal('offline')
  })

  it('makeBookmarksInitialState should add offline bookmark', () => {
    // Given
    const before = {
      activeBookmark: 'anything',
      allBookmarkIds: ['x'],
      bookmarksById: {'x': {name: 'x'}}
    }
    const key = 'bookmarks'

    // When
    const after = makeBookmarksInitialState(bookmarks)(key, before)

    // Then
    expect(after.activeBookmark).to.equal('offline')
    expect(after.bookmarksById['offline']).not.to.be.undefined
    expect(after.bookmarksById['offline'].name).to.equal('Offline')
    expect(after.bookmarksById['x']).not.to.be.undefined
  })
})
