import { put, take, select, call } from 'redux-saga/effects'
import helper from '../services/commandInterpreterHelper'
import frames from '../main/frames'
import { getSettings } from '../selectors'
import { cleanCommand } from '../services/commandUtils'
import editor from '../main/editor'
import bolt from '../services/bolt/bolt'

function * watchCommands () {
  while (true) {
    const action = yield take(editor.actionTypes.USER_COMMAND_QUEUED)
    yield put(editor.actions.addHistory({cmd: action.cmd}))
    const settingsState = yield select(getSettings)
    const cleanCmd = cleanCommand(action.cmd)
    if (cleanCmd[0] === settingsState.cmdchar) {
      yield call(handleClientCommand, action.cmd, settingsState.cmdchar)
    } else {
      try {
        const res = yield call(bolt.transaction, action.cmd)
        yield put(frames.actions.add({cmd: action.cmd, result: res, type: 'cypher'}))
      } catch (e) {
        yield put(frames.actions.add({cmd: action.cmd, errors: e, type: 'cypher'}))
      }
    }
  }
}

function * handleClientCommand (cmd, cmdchar) {
  const interpreted = helper.interpret(cmd.substr(cmdchar.length))
  yield call(interpreted.exec, cmd, cmdchar)
}

export {
  watchCommands,
  handleClientCommand
}
