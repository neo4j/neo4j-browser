import { fork } from 'redux-saga/effects'
import { watchCommands } from './commandInterpreter'
import { watchFavorites, readFavorites } from './favoritesStorage'
import { startHeartbeat } from './heartbeat'

export default function * sagas () {
  yield [ fork(startHeartbeat), fork(watchCommands), fork(watchFavorites), fork(readFavorites) ]
}
