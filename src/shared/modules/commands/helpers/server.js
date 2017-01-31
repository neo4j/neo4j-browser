import { splitStringOnFirst, splitStringOnLast } from 'services/commandUtils'
import bolt from 'services/bolt/bolt'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { UnknownCommandError, getErrorMessage, ConnectionNotFoundError, AddServerValidationError } from 'services/exceptions'
import { add as addFrame } from 'shared/modules/stream/streamDuck'

export function handleServerCommand (action, cmdchar, put, store) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'list') {
    handleServerListCommand(action, cmdchar, put, store)
    return
  }
  if (serverCmd === 'connect') {
    connectToConnection(action, props, put, store)
    return
  }
  if (serverCmd === 'add') {
    handleServerAddCommand(action, cmdchar, put, store)
    return
  }
  put(addFrame({...action, type: 'error', error: {message: getErrorMessage(UnknownCommandError(action.cmd))}}))
  return
}

function handleServerListCommand (action, cmdchar, put, store) {
  const state = connections.getConnections(store.getState())
  put(addFrame({...action, type: 'pre', result: JSON.stringify(state, null, 2)}))
}

function connectToConnection (action, connectionName, put, store) {
  const state = store.getState()
  try {
    let load = (data) => bolt.openConnection(data)
    const connection = bolt.getConnection(connectionName)
    if (connection) load = (data) => bolt.useConnection(data.name)
    const foundConnections = connections.getConnections(state).filter((c) => c.name === connectionName)
    if (!foundConnections.length) throw new ConnectionNotFoundError(connectionName)
    const connectionData = foundConnections[0]
    if (connectionData.type === 'bolt') {
      load(connectionData)
    } else {
      bolt.useConnection('offline')
    }
    put(connections.setActiveConnection(connectionData.id))
  } catch (e) {
    put(addFrame({...action, type: 'error', error: {message: getErrorMessage(e)}}))
  }
}

function handleServerAddCommand (action, cmdchar, put, store) {
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
    put(addFrame({...action, type: 'error', error: {message: getErrorMessage(e)}}))
    return
  }
  put(connections.addConnection({name, username, password, host}))
  const state = store.getState()
  put(addFrame({...action, type: 'pre', result: JSON.stringify(connections.getConnections(state), null, 2)}))
}
