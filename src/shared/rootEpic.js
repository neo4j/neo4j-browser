
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic } from './modules/commands/commandsDuck'
import { dbMetaEpic } from './modules/dbMeta/dbMetaDuck'
import { discoveryEpic } from './modules/discovery/discoveryDuck'

export default combineEpics(
  handleCommandsEpic,
  dbMetaEpic,
  discoveryEpic
)
