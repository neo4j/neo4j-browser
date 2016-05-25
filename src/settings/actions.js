import * as t from './actionTypes'

export const update = (settings) => {
  return {
    type: t.UPDATE,
    state: settings
  }
}

export const addServerBookmark = ({name, username, password, host}) => {
  return {
    type: t.ADD_SERVER_BOOKMARK,
    bookmark: {name, username, password, host}
  }
}
