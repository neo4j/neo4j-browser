import { put, take, select } from 'redux-saga/effects'
import { addFrame } from '../action_creators'
import { getSettings } from '../selectors'
import { cleanCommand } from '../services/commandUtils'

function * watchCommands () {
  let action = ''
  let cleanCmd = ''
  let settings = yield select(getSettings)
  while (true) {
    action = yield take('USER_COMMAND_QUEUED')
    settings = yield select(getSettings)
    cleanCmd = cleanCommand(action.cmd)
    if (cleanCmd[0] === settings.cmdchar) {
      yield put(addFrame(action.cmd))
    } else {
      yield put(addFrame(action.cmd))
    }
  }
}

export {
  watchCommands
}
