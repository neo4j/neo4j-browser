import { take, put, select, call } from 'redux-saga/effects'
import frames from '../../main/frames'
import bookmarks from '../../lib/components/Bookmarks'
import { splitStringOnFirst, splitStringOnLast } from '../../services/commandUtils'
import bolt from '../../services/bolt/bolt'
import { UserException } from '../../services/exceptions'

export function * watchBookmarkSelection () {
  while (true) {
    const selectAction = yield take(bookmarks.actionTypes.SELECT)
    const state = yield select((s) => s)
    const foundBookmarks = bookmarks.selectors.getBookmarks(state).filter((c) => c.id === selectAction.bookmarkId)
    yield call(connectToBookmark, null, foundBookmarks[0].name)
  }
}

export function * handleServerCommand (action, cmdchar) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'add') {
    yield call(handleServerAddCommand, action, cmdchar)
    return
  }
  if (serverCmd === 'use') {
    yield call(useConnection, action, props)
    return
  }
  if (serverCmd === 'connect') {
    yield call(connectToBookmark, action, props)
    return
  }
  yield put(frames.actions.add({...action, type: 'unknown'}))
  return
}

export function * connectToBookmark (action, connectionName) {
  const state = yield select((s) => s)
  try {
    const connection = yield call(bolt.getConnection, connectionName)
    if (connection) return yield useConnection(action, connectionName)
    const foundBookmarks = bookmarks.selectors.getBookmarks(state).filter((c) => c.name === connectionName)
    if (!foundBookmarks.length) throw new UserException('No connection with the name ' + connectionName + ' found. Add a bookmark before trying to connect.')
    const bookmarkData = foundBookmarks[0]
    if (bookmarkData.type === 'bolt') {
      yield call(bolt.openConnection, bookmarkData)
    }
    else {
      yield call(bolt.useConnection, 'offline')
    }
    yield put(bookmarks.actions.setActiveBookmark(bookmarkData.id))
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
  }
}

export function * useConnection (action, connectionName) {
  const state = yield select((s) => s)
  try {
    const foundBookmarks = bookmarks.selectors.getBookmarks(state).filter((c) => c.name === connectionName)
    if (!foundBookmarks.length) throw new UserException('No connection with the name ' + connectionName + ' found. Add a bookmark before trying to connect.')
    if (foundBookmarks[0].type === 'bolt') {
      const connection = yield call(bolt.getConnection, connectionName)
      if (!connection) throw new UserException('No open connection with the name ' + connectionName + ' found. You have to connect to a bookmark before you can use it.')
      yield call(bolt.useConnection, connection.name)
    }
    else {
      yield call(bolt.useConnection, 'offline')
    }
    yield put(bookmarks.actions.setActiveBookmark(foundBookmarks[0].id))
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
  }
}

export function * handleServerAddCommand (action, cmdchar) {
  // :server add name username:password@host:port
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  const [name, creds] = splitStringOnFirst(props, ' ')
  const [userCreds, host] = splitStringOnLast(creds, '@')
  const [username, password] = splitStringOnFirst(userCreds, ':')
  try {
    const errorMessage = 'Wrong format. It should be ":server add name username:password@host:port"'
    if (!serverCmd || !props) throw new UserException(errorMessage)
    if (!name || !creds) throw new UserException(errorMessage)
    if (!userCreds || !host) throw new UserException(errorMessage)
    if (!username || !password) throw new UserException(errorMessage)
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
    return
  }
  yield put(bookmarks.actions.addServerBookmark({name, username, password, host}))
  const state = yield select((s) => s)
  yield put(frames.actions.add({...action, type: 'pre', contents: JSON.stringify(bookmarks.selectors.getBookmarks(state), null, 2)}))
}
