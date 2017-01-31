import bolt from 'services/bolt/bolt'
import { BoltConnectionError, BoltError } from 'services/exceptions'

export const handleCypherCommand = (action, cmdchar, put, store) => {
  try {
    const connection = bolt.getConnection()
    if (!connection) throw new BoltConnectionError()
    return connection.transaction(action.cmd)
        .then((res) => {
          return {...action, type: 'cypher', result: res}
        }).catch((e) => {
          return {...action, type: 'cypher', error: {...e}}
        })
  } catch (e) {
    return {...action, type: 'cypher', error: {...e}}
  }
}
