import * as t from './actionTypes'
import { v4 } from 'uuid'

export const setActiveBookmark = (id) => {
  return {
    type: t.SET_ACTIVE,
    bookmarkId: id
  }
}

export const addServerBookmark = ({name, username, password, host}) => {
  return {
    type: t.ADD,
    bookmark: {id: v4(), name, username, password, host}
  }
}
