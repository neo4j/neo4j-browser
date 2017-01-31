import { splitStringOnFirst } from 'services/commandUtils'
import bolt from 'services/bolt/bolt'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { UnknownCommandError, getErrorMessage, ConnectionNotFoundError } from 'services/exceptions'
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
    const connection = bolt.getConnection(connectionName)
    // if (connection) return yield handleUseConnectionCommand(action, connectionName, onError)
    const foundConnections = connections.getConnections(state).filter((c) => c.name === connectionName)
    if (!foundConnections.length) throw new ConnectionNotFoundError(connectionName)
    const connectionData = foundConnections[0]
    if (connectionData.type === 'bolt') {
      bolt.openConnection(connectionData)
    } else {
      bolt.useConnection('offline')
    }
    put(connections.setActiveConnection(connectionData.id))
  } catch (e) {
    put(addFrame({...action, type: 'error', error: {message: getErrorMessage(e)}}))
  }
}
