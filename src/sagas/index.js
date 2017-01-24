import { fork } from 'redux-saga/effects'
import { watchCommands } from './commandInterpreter'
import { watchBookmarkSelection } from './command_sagas/serverCommand'
import { startHeartbeat } from '../shared/modules/dbMeta/dbMetaDuck'
import { startBackgroundDataSources } from './command_sagas/dataSourceCommand'

export default function * sagas () {
  yield [
    fork(startHeartbeat),
    fork(watchCommands),
    fork(watchBookmarkSelection),
    fork(startBackgroundDataSources)
  ]
}
