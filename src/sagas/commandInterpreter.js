import { put, take, select, call } from 'redux-saga/effects'
import helper from '../services/commandInterpreterHelper'
import frames from '../main/frames'
import bookmarks from '../lib/components/Bookmarks'
import { getSettings } from '../selectors'
import { cleanCommand } from '../services/commandUtils'
import editor from '../main/editor'
import bolt from '../services/bolt/bolt'

function * watchCommands () {
  while (true) {
    let action = yield take(editor.actionTypes.USER_COMMAND_QUEUED)
    yield put(editor.actions.addHistory({cmd: action.cmd}))
    const settingsState = yield select(getSettings)
    action.context = yield select(bookmarks.selectors.getActiveBookmark)
    const cleanCmd = cleanCommand(action.cmd)
    if (settingsState.singleFrameMode) {
      const currentFrames = yield select((state) => frames.selectors.getFrames(state))
      action.id = null
      if (currentFrames.length) {
        action.id = currentFrames[currentFrames.length - 1].id
      }
    }
    if (cleanCmd[0] === settingsState.cmdchar) {
      yield call(handleClientCommand, action, settingsState.cmdchar)
    } else {
      try {
        const res = yield call(bolt.transaction, action.cmd)
        yield put(frames.actions.add({...action, result: res, type: 'cypher'}))
      } catch (e) {
        yield put(frames.actions.add({...action, errors: e, type: 'cypher'}))
      }
    }
  }
}

function * handleClientCommand (action, cmdchar) {
  const interpreted = helper.interpret(action.cmd.substr(cmdchar.length))
  yield call(interpreted.exec, action, cmdchar)
}

export {
  watchCommands,
  handleClientCommand
}
