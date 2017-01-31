import bolt from 'services/bolt/bolt'
import { BoltConnectionError } from 'services/exceptions'
import { add as addFrame } from 'shared/modules/stream/streamDuck'

export const handleCypherCommand = (action, cmdchar, put, store) => {
  try {
      const connection = bolt.getConnection()
      if (!connection) throw new BoltConnectionError()
      connection.transaction(action.cmd)
        .then((res) => {
          put(addFrame({...action, type: 'cypher', result: res}))
        })
    } catch (e) {
      put(addFrame({...action, type: 'cypher', error: {...e}}))
    }
}
