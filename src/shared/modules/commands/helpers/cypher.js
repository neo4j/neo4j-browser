import bolt from 'services/bolt/bolt'
import { send } from 'shared/modules/requests/requestsDuck'

export const handleCypherCommand = (action, put) => {
  const [id, request] = bolt.trackedTransaction(action.cmd, undefined, undefined, action.requestId)
  put(send('cypher', id))
  return [id, request]
}
