
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic } from './modules/commands/commandsDuck'
import { dbMetaEpic } from './modules/dbMeta/dbMetaDuck'

export default combineEpics(
  handleCommandsEpic,
  dbMetaEpic
)
