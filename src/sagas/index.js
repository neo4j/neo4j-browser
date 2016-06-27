import { fork } from 'redux-saga/effects'
import { watchCommands } from './commandInterpreter'
import { watchBookmarkSelection } from './command_sagas/serverCommand'
import { startHeartbeat } from './heartbeat'

export default function * sagas () {
  yield [ fork(startHeartbeat), fork(watchCommands), fork(watchBookmarkSelection) ]
}
