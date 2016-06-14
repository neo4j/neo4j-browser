import { fork } from 'redux-saga/effects'
import { watchCommands } from './commandInterpreter'
// import { startHeartbeat } from './heartbeat'

export default function * sagas () {
  yield [ fork(watchCommands) ]
}
