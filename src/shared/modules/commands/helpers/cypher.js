import bolt from 'services/bolt/bolt'
import { BoltConnectionError } from 'services/exceptions'

export const handleCypherCommand = (action) => {
  const connection = bolt.getConnection()
  if (!connection) return {...action, type: 'cypher', error: {...BoltConnectionError()}}
  return connection.transaction(action.cmd)
      .then((res) => {
        return {...action, type: 'cypher', result: res}
      }).catch((e) => {
        return {...action, type: 'cypher', error: {...e}}
      })
}
