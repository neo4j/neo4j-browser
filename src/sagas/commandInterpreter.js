import { put, take, select, call } from 'redux-saga/effects'
import { addFrame } from '../action_creators'
import { getSettings } from '../selectors'
import { cleanCommand } from '../services/commandUtils'
import bolt from '../services/bolt'

function * watchCommands () {
  let action = ''
  let cleanCmd = ''
  let settings = yield select(getSettings)
  while (true) {
    action = yield take('USER_COMMAND_QUEUED')
    settings = yield select(getSettings)
    cleanCmd = cleanCommand(action.cmd)
    if (cleanCmd[0] === settings.cmdchar) {
      yield put(addFrame({cmd: action.cmd}))
    } else {
      const res = yield call(bolt.transaction, action.cmd)
      yield put(addFrame({cmd: action.cmd, resultPromise: res}))
    }
  }
}

export {
  watchCommands
}
