import * as t from './actionTypes'

const initialState = {
  allIds: [],
  byId: {}
}

/**
 * Selectors
*/
export function getBookmarks (state) {
  return state[NAME].allBookmarkIds.map((id) => state[NAME].bookmarksById[id])
}

/**
 * Reducer helpers
 */
const add = (state, obj) => {
  const byId = {...state.byId, [obj.id]: obj}
  const allIds = state.allIds.concat([obj.id])
  return Object.assign(
    {},
    state,
    {allIds: allIds},
    {byId: byId}
  )
}


export default function (state = initialState, action) {
  switch (action.type) {
    case t.ADD:
      return add(state, action.widget)
    default:
      return state
  }
}
