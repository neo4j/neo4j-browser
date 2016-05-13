import { put, take, select, call } from 'redux-saga/effects'
import helper from '../services/commandInterpreterHelper'
import frames from '../frames'
import { getSettings } from '../selectors'
import { cleanCommand } from '../services/commandUtils'
import editor from '../editor'
import bolt from '../services/bolt'

function * watchCommands () {
  let action = ''
  let cleanCmd = ''
  let settings = yield select(getSettings)
  while (true) {
    action = yield take(editor.actionTypes.USER_COMMAND_QUEUED)
    settings = yield select(getSettings)
    cleanCmd = cleanCommand(action.cmd)
    if (cleanCmd[0] === settings.cmdchar) {
      yield call(handleClientCommand, settings.cmdchar, action.cmd)
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

function * handleClientCommand (cmdchar, cmd) {
  const interpreted = helper.interpret(cmd.substr(cmdchar.length))

  if (interpreted.name === 'clear') {
    yield put(frames.actions.clear())
  } else if (interpreted.name === 'config') {
    const settings = yield select(getSettings)
    yield put(frames.actions.add({cmd: cmd, type: 'pre', contents: JSON.stringify(settings, null, 2)}))
  } else {
    yield put(frames.actions.add({cmd: cmd, type: 'cmd'}))
  }
}

export {
  watchCommands,
  handleClientCommand
}
