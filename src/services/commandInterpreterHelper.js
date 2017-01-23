import { select, call, put } from 'redux-saga/effects'
import * as frames from '../shared/modules/stream/streamDuck'
import { getHistory } from '../selectors'
import { cleanHtml } from 'services/remoteUtils'
import remote from 'services/remote'
import { handleServerCommand } from 'sagas/command_sagas/serverCommand'
import { handleConfigCommand } from 'sagas/command_sagas/configCommand'
import { handleWidgetCommand } from 'sagas/command_sagas/widgetCommand'
import { handleDataSourceCommand } from 'sagas/command_sagas/dataSourceCommand'
import { CouldNotFetchRemoteGuideError, UnknownCommandError } from 'services/exceptions'

const availableCommands = [{
  name: 'clear',
  match: (cmd) => cmd === 'clear',
  exec: function * () {
    yield put(frames.clear())
  }
}, {
  name: 'config',
  match: (cmd) => /^config(\s|$)/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(handleConfigCommand, action, cmdchar, onSuccess, onError)
  }
}, {
  name: 'server',
  match: (cmd) => /^server(\s)/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(handleServerCommand, action, cmdchar, onSuccess, onError)
  }
}, {
  name: 'play-remote',
  match: (cmd) => /^play(\s|$)https?/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    const url = action.cmd.substr(cmdchar.length + 'play '.length)
    try {
      const content = yield call(remote.get, url)
      yield call(onSuccess, {...action, type: 'play-remote'}, cleanHtml(content))
    } catch (e) {
      yield call(onError, {...action, type: 'play-remote'}, CouldNotFetchRemoteGuideError(e))
    }
  }
}, {
  name: 'play',
  match: (cmd) => /^play(\s|$)/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(onSuccess, {...action, type: 'play'})
  }
}, {
  name: 'history',
  match: (cmd) => cmd === 'history',
  exec: function * (action, cmdchar, onSuccess, onError) {
    const historyState = yield select(getHistory)
    yield call(onSuccess, {...action, type: 'history'}, historyState)
  }
}, {
  name: 'widget',
  match: (cmd) => /^widget(\s)/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(handleWidgetCommand, action, cmdchar, onSuccess, onError)
  }
}, {
  name: 'datasource',
  match: (cmd) => /^data\s?-?source(\s)/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(handleDataSourceCommand, action, cmdchar, onSuccess, onError)
  }
}, {
  name: 'style',
  match: (cmd) => /^style/.test(cmd),
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(onSuccess, {...action, type: 'style'})
  }
}, {
  name: 'catch-all',
  match: () => true,
  exec: function * (action, cmdchar, onSuccess, onError) {
    yield call(onError, {...action, type: 'unknown'}, UnknownCommandError(action.cmd))
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
