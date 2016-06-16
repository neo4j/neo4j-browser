import * as t from './actionTypes'
import { v4 } from 'uuid'

export const update = (settings) => {
  return {
    type: t.UPDATE,
    state: settings
  }
}

export const setActiveBookmark = (id) => {
  return {
    type: t.SET_ACTIVE_BOOKMARK,
    bookmarkId: id
  }
}

export const addServerBookmark = ({name, username, password, host}) => {
  return {
    type: t.ADD_SERVER_BOOKMARK,
    bookmark: {id: v4(), name, username, password, host}
  }
}
