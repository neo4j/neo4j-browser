import { put, take, select, call } from 'redux-saga/effects'
import helper from '../services/commandInterpreterHelper'
import frames from '../main/frames'
import { getSettings, getHistory } from '../selectors'
import { cleanCommand } from '../services/commandUtils'
import editor from '../main/editor'
import bolt from '../services/bolt/bolt'
import remote from '../services/remote'
import { handleServerCommand } from './command_sagas/serverCommand'
import { handleConfigCommand } from './command_sagas/configCommand'

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
  if (interpreted.name === 'play-remote') {
    const url = cmd.substr(cmdchar.length + 'play '.length)
    try {
      const content = yield call(remote.get, url)
      yield put(frames.actions.add({cmd: cmd, type: interpreted.name, contents: content}))
    } catch (e) {
      yield put(frames.actions.add({cmd: cmd, type: interpreted.name, contents: 'Can not fetch remote guide: ' + e}))
    }
  } else if (interpreted.name === 'play') {
    yield put(frames.actions.add({cmd: cmd, type: interpreted.name}))
  } else if (interpreted.name === 'clear') {
    yield put(frames.actions.clear())
  } else if (interpreted.name === 'config') {
    yield call(handleConfigCommand, cmd, cmdchar)
  } else if (interpreted.name === 'server') {
    yield call(handleServerCommand, cmd, cmdchar)
  } else if (interpreted.name === 'history') {
    const historyState = yield select(getHistory)
    yield put(frames.actions.add({cmd: cmd, type: 'history', history: historyState}))
  } else {
    yield put(frames.actions.add({cmd: cmd, type: 'unknown'}))
  }
}

export {
  watchCommands,
  handleClientCommand
}
