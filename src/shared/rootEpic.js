
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic } from './modules/commands/commandsDuck'
import { tryConnectEpic, connectEpic, startupConnectEpic, startupConnectionSuccessEpic, startupConnectionFailEpic, detectNewConnectionEpic } from './modules/connections/connectionsDuck'
import { dbMetaEpic } from './modules/dbMeta/dbMetaDuck'
import { cancelRequestEpic } from './modules/requests/requestsDuck'
import { discoveryOnStartupEpic } from './modules/discovery/discoveryDuck'
import { cypherRequestEpic, handleForcePasswordChangeEpic } from './modules/cypher/cypherDuck'

export default combineEpics(
  handleCommandsEpic,
  tryConnectEpic,
  connectEpic,
  startupConnectEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectNewConnectionEpic,
  dbMetaEpic,
  cancelRequestEpic,
  discoveryOnStartupEpic,
  cypherRequestEpic,
  handleForcePasswordChangeEpic
)
