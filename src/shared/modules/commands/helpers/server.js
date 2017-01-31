import { splitStringOnFirst } from 'services/commandUtils'
import * as connections from 'shared/modules/connections/connectionsDuck'
import { UnknownCommandError, getErrorMessage } from 'services/exceptions'
import { add as addFrame } from 'shared/modules/stream/streamDuck'

export function handleServerCommand (action, cmdchar, put, store) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'list') {
    handleServerListCommand(action, cmdchar, put, store)
    return
  }
  put(addFrame({...action, type: 'error', error: {message: getErrorMessage(UnknownCommandError(action.cmd))}}))
  return
}

function handleServerListCommand (action, cmdchar, put, store) {
  const state = connections.getConnections(store.getState())
  put(addFrame({...action, type: 'pre', result: JSON.stringify(state, null, 2)}))
}
