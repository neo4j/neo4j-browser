
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic, postConnectCmdEpic } from './modules/commands/commandsDuck'
import { connectEpic, disconnectEpic, startupConnectEpic, disconnectSuccessEpic, startupConnectionSuccessEpic, startupConnectionFailEpic, detectActiveConnectionChangeEpic } from './modules/connections/connectionsDuck'
import { dbMetaEpic, clearMetaOnDisconnectEpic } from './modules/dbMeta/dbMetaDuck'
import { cancelRequestEpic } from './modules/requests/requestsDuck'
import { discoveryOnStartupEpic } from './modules/discovery/discoveryDuck'
import { cypherRequestEpic, handleForcePasswordChangeEpic } from './modules/cypher/cypherDuck'

export default combineEpics(
  handleCommandsEpic,
  postConnectCmdEpic,
  connectEpic,
  disconnectEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  dbMetaEpic,
  clearMetaOnDisconnectEpic,
  cancelRequestEpic,
  discoveryOnStartupEpic,
  cypherRequestEpic,
  handleForcePasswordChangeEpic
)
