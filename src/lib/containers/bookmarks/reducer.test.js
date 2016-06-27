import {expect} from 'chai'
import bookmarks from '.'

describe('bookmarks reducer', () => {
  it('handles bookmarks.actionTypes.ADD', () => {
    const action = {
      type: bookmarks.actionTypes.ADD,
      bookmark: {
        id: 'x',
        name: 'bm'
      }
    }
    const nextState = bookmarks.reducer(undefined, action)
    expect(nextState.allBookmarkIds).to.deep.equal(['x'])
    expect(nextState.bookmarksById).to.deep.equal({'x': {
      id: 'x',
      name: 'bm'
    }})
  })

  it('handles bookmarks.actionTypes.SET_ACTIVE', () => {
    const initialState = {
      allBookmarkIds: [1, 2, 3],
      bookmarksById: {
        '1': {id: 1, name: 'bm1'},
        '2': {id: 2, name: 'bm2'},
        '3': {id: 3, name: 'bm3'}
      }
    }
    const action = {
      type: bookmarks.actionTypes.SET_ACTIVE,
      bookmarkId: 2
    }
    const nextState = bookmarks.reducer(initialState, action)
    expect(nextState.activeBookmark).to.equal(2)
  })
})
