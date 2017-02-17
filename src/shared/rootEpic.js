
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic } from './modules/commands/commandsDuck'
import { dbMetaEpic } from './modules/dbMeta/dbMetaDuck'
import { cancelRequestEpic } from './modules/requests/requestsDuck'
import { addDiscoveryEpic, startDiscoveryEpic } from './modules/discovery/discoveryDuck'
import { cypherRequestEpic } from './modules/cypher/cypherDuck'

export default combineEpics(
  handleCommandsEpic,
  dbMetaEpic,
  cancelRequestEpic,
  addDiscoveryEpic,
  startDiscoveryEpic,
  cypherRequestEpic
)
