
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic } from './modules/commands/commandsDuck'

export default combineEpics(
  handleCommandsEpic
)
