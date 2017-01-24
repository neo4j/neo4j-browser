
export const makeBookmarksInitialState = (bookmarks) => {
  return (key, val) => {
    if (key !== 'bookmarks') return val
    if (!val) {
      val = bookmarks.reducer(undefined, '')
    }
    const out = {}
    out.allBookmarkIds = [].concat(val.allBookmarkIds)
    out.bookmarksById = Object.assign({}, val.bookmarksById)
    out.activeBookmark = 'offline' // Always start in offline mode

    // If offline exists, return
    if (val.allBookmarkIds.indexOf('offline') > -1) return out

    // If not, add it
    out.allBookmarkIds = ['offline'].concat(out.allBookmarkIds)
    out.bookmarksById = Object.assign(out.bookmarksById, {'offline': {name: 'Offline', type: 'offline', id: 'offline'}})
    return out
  }
}

export const makeBookmarksPersistedState = () => {
  return (key, val) => {
    if (key !== 'bookmarks') return val
    if (!val) return val
    const out = {}
    out.allBookmarkIds = [].concat(val.allBookmarkIds)
    out.bookmarksById = Object.assign({}, val.bookmarksById)
    out.activeBookmark = 'offline' // To start in offline mode
    return out
  }
}
