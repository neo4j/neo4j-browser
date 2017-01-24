import { fork } from 'redux-saga/effects'
import { watchCommands } from './commandInterpreter'
import { watchConnectionSelection } from './command_sagas/serverCommand'
import { startHeartbeat } from '../shared/modules/dbMeta/dbMetaDuck'
import { startBackgroundDataSources } from './command_sagas/dataSourceCommand'

export default function * sagas () {
  yield [
    fork(startHeartbeat),
    fork(watchCommands),
    fork(watchConnectionSelection),
    fork(startBackgroundDataSources)
  ]
}
