import { NAME } from './constants'
import * as t from './actionTypes'

const initialState = {
  allBookmarkIds: [],
  bookmarksById: {},
  activeBookmark: null
}

/**
 * Selectors
*/
export function getBookmarks (state) {
  return state[NAME].allBookmarkIds.map((id) => state[NAME].bookmarksById[id])
}

export function getActiveBookmark (state) {
  return state[NAME].activeBookmark
}

const addBookmark = (state, obj) => {
  const bookmarksById = {...state.bookmarksById, [obj.id]: obj}
  let allBookmarkIds = state.allBookmarkIds
  if (state.allBookmarkIds.indexOf(obj.id) < 0) {
    allBookmarkIds = state.allBookmarkIds.concat([obj.id])
  }
  return Object.assign(
    {},
    state,
    {allBookmarkIds: allBookmarkIds},
    {bookmarksById: bookmarksById}
  )
}

export default function settings (state = initialState, action) {
  switch (action.type) {
    case t.ADD:
      return addBookmark(state, action.bookmark)
    case t.SET_ACTIVE:
      return {...state, activeBookmark: action.bookmarkId}
    default:
      return state
  }
}
