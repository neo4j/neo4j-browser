import bolt from 'services/bolt/bolt'
import { send } from 'shared/modules/requests/requestsDuck'

export const handleCypherCommand = (action, put, params = {}) => {
  const [id, request] = bolt.routedWriteTransaction(action.cmd, params, action.requestId, true)
  put(send('cypher', id))
  return [id, request]
}
