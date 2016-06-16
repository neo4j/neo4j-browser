import { put, take, select, call } from 'redux-saga/effects'
import helper from '../services/commandInterpreterHelper'
import frames from '../main/frames'
import { getSettings } from '../selectors'
import { cleanCommand } from '../services/commandUtils'
import editor from '../main/editor'
import bolt from '../services/bolt/bolt'

function * watchCommands () {
  while (true) {
    let action = yield take(editor.actionTypes.USER_COMMAND_QUEUED)
    yield put(editor.actions.addHistory({cmd: action.cmd}))
    const settingsState = yield select(getSettings)
    const cleanCmd = cleanCommand(action.cmd)
    if (settingsState.singleFrameMode) {
      const currentFrames = yield select((state) => frames.selectors.getFrames(state))
      action.id = null
      if (currentFrames.length) {
        action.id = currentFrames[currentFrames.length - 1].id
      }
    }
    if (cleanCmd[0] === settingsState.cmdchar) {
      yield call(handleClientCommand, action, settingsState.cmdchar, settingsState.activeBookmark)
    } else {
      try {
        const res = yield call(bolt.transaction, action.cmd)
        yield put(frames.actions.add({...action, result: res, type: 'cypher', context: settingsState.activeBookmark}))
      } catch (e) {
        yield put(frames.actions.add({...action, errors: e, type: 'cypher', context: settingsState.activeBookmark}))
      }
    }
  }
}

function * handleClientCommand (action, cmdchar, context) {
  const interpreted = helper.interpret(action.cmd.substr(cmdchar.length))
  yield call(interpreted.exec, action, cmdchar, context)
}

export {
  watchCommands,
  handleClientCommand
}
