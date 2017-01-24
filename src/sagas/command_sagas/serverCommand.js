import { take, put, select, call } from 'redux-saga/effects'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { splitStringOnFirst, splitStringOnLast } from 'services/commandUtils'
import bolt from 'services/bolt/bolt'
import { AddServerValidationError, ConnectionNotFoundError, OpenConnectionNotFoundError, UnknownCommandError } from 'services/exceptions'

export function * watchConnectionSelection () {
  while (true) {
    const selectAction = yield take(connections.SELECT)
    const state = yield select((s) => s)
    const foundConnections = connections.getConnections(state).filter((c) => c.id === selectAction.connectionId)
    yield call(connectToConnection, null, foundConnections[0].name)
  }
}

export function * handleServerCommand (action, cmdchar, onSuccess, onError) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'add') {
    yield call(handleServerAddCommand, action, cmdchar, onSuccess, onError)
    return
  }
  if (serverCmd === 'list') {
    yield call(handleServerListCommand, action, cmdchar, onSuccess, onError)
    return
  }
  if (serverCmd === 'use') {
    yield call(handleUseConnectionCommand, action, props, onError)
    return
  }
  if (serverCmd === 'connect') {
    yield call(connectToConnection, action, props, onSuccess, onError)
    return
  }
  yield call(onError, {...action, type: 'unknown'}, UnknownCommandError(action.cmd))
  return
}

export function * handleServerListCommand (action, cmdchar, onSuccess) {
  const state = yield select(connections.getConnections)
  yield call(onSuccess, {...action, type: 'pre'}, JSON.stringify(state, null, 2))
}

export function * connectToConnection (action, connectionName, onSuccess, onError) {
  const state = yield select((s) => s)
  try {
    const connection = yield call(bolt.getConnection, connectionName)
    if (connection) return yield handleUseConnectionCommand(action, connectionName, onError)
    const foundConnections = connections.getConnections(state).filter((c) => c.name === connectionName)
    if (!foundConnections.length) throw new ConnectionNotFoundError(connectionName)
    const connectionData = foundConnections[0]
    if (connectionData.type === 'bolt') {
      yield call(bolt.openConnection, connectionData)
    } else {
      yield call(bolt.useConnection, 'offline')
    }
    yield put(connections.setActiveConnection(connectionData.id))
  } catch (e) {
    yield call(onError, {...action, type: 'cmd'}, e)
  }
}

export function * handleUseConnectionCommand (action, connectionName, onError) {
  const state = yield select((s) => s)
  try {
    const foundConnections = connections.getConnections(state).filter((c) => c.name === connectionName)
    if (!foundConnections.length) throw new ConnectionNotFoundError(connectionName)
    if (foundConnections[0].type === 'bolt') {
      const connection = yield call(bolt.getConnection, connectionName)
      if (!connection) throw new OpenConnectionNotFoundError(connectionName)
      yield call(bolt.useConnection, connection.name)
    } else {
      yield call(bolt.useConnection, 'offline')
    }
    yield put(connections.setActiveConnection(foundConnections[0].id))
  } catch (e) {
    yield call(onError, {...action, type: 'cmd'}, e)
  }
}

export function * handleServerAddCommand (action, cmdchar, onSuccess, onError) {
  // :server add name username:password@host:port
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  const [name, creds] = splitStringOnFirst(props, ' ')
  const [userCreds, host] = splitStringOnLast(creds, '@')
  const [username, password] = splitStringOnFirst(userCreds, ':')
  try {
    if (!serverCmd || !props) throw new AddServerValidationError()
    if (!name || !creds) throw new AddServerValidationError()
    if (!userCreds || !host) throw new AddServerValidationError()
    if (!username || !password) throw new AddServerValidationError()
  } catch (e) {
    yield call(onError, {...action, type: 'cmd'}, e)
    return
  }
  yield put(connections.addConnection({name, username, password, host}))
  const state = yield select((s) => s)
  yield call(onSuccess, {...action, type: 'pre'}, JSON.stringify(connections.getConnections(state), null, 2))
}
