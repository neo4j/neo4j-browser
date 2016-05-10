import { fork } from 'redux-saga/effects'
import { watchCommands } from './commandInterpreter'

export default function * sagas () {
  yield [ fork(watchCommands) ]
}
