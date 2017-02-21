import { splitStringOnFirst, splitStringOnLast } from 'services/commandUtils'
import bolt from 'services/bolt/bolt'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { CONNECTION_ID as DISCOVERY_CONNECTION_ID } from 'shared/modules/discovery/discoveryDuck'
import { BoltConnectionError, UnknownCommandError, getErrorMessage, ConnectionNotFoundError, AddServerValidationError } from 'services/exceptions'

export function handleServerCommand (action, cmdchar, put, store) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'list') {
    return handleServerListCommand(action, cmdchar, put, store)
  }
  if (serverCmd === 'connect') {
    return connectToConnection(action, props, put, store)
  }
  if (serverCmd === 'add') {
    return handleServerAddCommand(action, cmdchar, put, store)
  }
  if (serverCmd === 'user') {
    return handleUserCommand(action, props, cmdchar)
  }
  return {...action, type: 'error', error: {message: getErrorMessage(UnknownCommandError(action.cmd))}}
}

function handleServerListCommand (action, cmdchar, put, store) {
  const state = connections.getConnections(store.getState())
  return {...action, type: 'pre', result: JSON.stringify(state, null, 2)}
}

function handleUserCommand (action, props, cmdchar) {
  switch (props) {
    case 'list':
      return {...action, type: 'user-list'}
    case 'add':
      return {...action, type: 'user-add'}
  }
}

export function connectToConnection (action, connectionName, put, store) {
  const state = store.getState()
  try {
    connectionName = connectionName || DISCOVERY_CONNECTION_ID
    const foundConnections = connections.getConnections(state).filter((c) => c.name === connectionName)
    if (!foundConnections.length) throw new ConnectionNotFoundError(connectionName)
    const connectionData = foundConnections[0]
    let p
    if (connectionData.type === 'bolt') {
      p = bolt.connectToConnection(connectionData).then(() => {
        put(connections.setActiveConnection(connectionData.id))
        return {...action, type: 'connection', connectionData}
      }).catch((e) => {
        return {...action, type: 'connection', error: {message: getErrorMessage(e)}, connectionData}
      })
    } else {
      throw new BoltConnectionError(connectionData.id)
    }
    return p
  } catch (e) {
    return {...action, type: 'connection', error: {message: getErrorMessage(e)}}
  }
}

function handleServerAddCommand (action, cmdchar, put, store) {
  // :server add name username:password@host:port
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  const [name, creds] = splitStringOnFirst(props, ' ')
  let [userCreds, host] = splitStringOnLast(creds, '@')
  const [username, password] = splitStringOnFirst(userCreds, ':')
  try {
    if (!serverCmd || !props) throw new AddServerValidationError()
    if (!name || !creds) throw new AddServerValidationError()
    if (!userCreds || !host) throw new AddServerValidationError()
    if (!username || !password) throw new AddServerValidationError()
  } catch (e) {
    return {...action, type: 'error', error: {message: getErrorMessage(e)}}
  }
  host = 'bolt://' + host.replace(/bolt:\/\//, '')
  put(connections.addConnection({name, username, password, host}))
  const state = store.getState()
  return {...action, type: 'pre', result: JSON.stringify(connections.getConnections(state), null, 2)}
}
