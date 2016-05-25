import * as t from './actionTypes'

const initialState = {
  cmdchar: ':',
  maxHistory: 10,
  bookmarks: []
}

const addBookmark = (bookmarks, obj) => {
  const noDuplicateName = bookmarks.filter((bm) => bm.name !== obj.name)
  return [].concat(noDuplicateName, [obj])
}

export default function settings (state = initialState, action) {
  switch (action.type) {
    case t.UPDATE:
      return Object.assign(state, action.state)
    case t.ADD_SERVER_BOOKMARK:
      return Object.assign({}, state, {bookmarks: addBookmark(state.bookmarks, action.bookmark)})
  }
  return state
}
