import { select, call, put } from 'redux-saga/effects'
import frames from '../main/frames'
import { getHistory } from '../selectors'
import { cleanHtml } from '../services/remoteUtils'
import remote from '../services/remote'
import { handleServerCommand } from '../sagas/command_sagas/serverCommand'
import { handleConfigCommand } from '../sagas/command_sagas/configCommand'

const availableCommands = [{
  name: 'clear',
  match: (cmd) => cmd === 'clear',
  exec: function * () {
    yield put(frames.actions.clear())
  }
}, {
  name: 'config',
  match: (cmd) => /^config(\s|$)/.test(cmd),
  exec: function * (cmd, cmdchar) {
    yield call(handleConfigCommand, cmd, cmdchar)
  }
}, {
  name: 'server',
  match: (cmd) => /^server(\s)/.test(cmd),
  exec: function * (cmd, cmdchar) {
    yield call(handleServerCommand, cmd, cmdchar)
  }
}, {
  name: 'play-remote',
  match: (cmd) => /^play(\s|$)https?/.test(cmd),
  exec: function * (cmd, cmdchar) {
    const url = cmd.substr(cmdchar.length + 'play '.length)
    try {
      const content = yield call(remote.get, url)
      yield put(frames.actions.add({cmd: cmd, type: 'play-remote', contents: cleanHtml(content)}))
    } catch (e) {
      yield put(frames.actions.add({cmd: cmd, type: 'play-remote', contents: 'Can not fetch remote guide: ' + e}))
    }
  }
}, {
  name: 'play',
  match: (cmd) => /^play(\s|$)/.test(cmd),
  exec: function * (cmd, cmdchar) {
    yield put(frames.actions.add({cmd: cmd, type: 'play'}))
  }
}, {
  name: 'history',
  match: (cmd) => cmd === 'history',
  exec: function * (cmd, cmdchar) {
    const historyState = yield select(getHistory)
    yield put(frames.actions.add({cmd: cmd, type: 'history', history: historyState}))
  }
}, {
  name: 'catch-all',
  match: () => true,
  exec: function * (cmd, cmdchar) {
    yield put(frames.actions.add({cmd: cmd, type: 'unknown'}))
  }
}]

// First to match wins
const interpret = (cmd) => {
  return availableCommands.reduce((match, candidate) => {
    if (match) return match
    const isMatch = candidate.match(cmd)
    return isMatch ? candidate : null
  }, null)
}

export default {
  interpret
}
