import * as frames from 'shared/modules/stream/streamDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { update as updateQueryResult } from 'shared/modules/requests/requestsDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import { cleanHtml } from 'services/remoteUtils'
import remote from 'services/remote'
import { handleServerCommand } from 'shared/modules/commands/helpers/server'
import { handleCypherCommand } from 'shared/modules/commands/helpers/cypher'
import { handleParamCommand, handleParamsCommand } from 'shared/modules/commands/helpers/params'
import { handleGetConfigCommand, handleUpdateConfigCommand } from 'shared/modules/commands/helpers/config'
import { CouldNotFetchRemoteGuideError, UnknownCommandError } from 'services/exceptions'

const availableCommands = [{
  name: 'clear',
  match: (cmd) => cmd === 'clear',
  exec: function (action, cmdchar, put) {
    put(frames.clear())
  }
}, {
  name: 'config',
  match: (cmd) => /^config(\s|$)/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    handleUpdateConfigCommand(action, cmdchar, put, store)
    put(frames.add({...action, ...handleGetConfigCommand(action, cmdchar, store)}))
  }
}, {
  name: 'set-param',
  match: (cmd) => /^param\s/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    const res = handleParamCommand(action, cmdchar, put, store)
    put(frames.add({...action, ...res, type: 'param'}))
  }
}, {
  name: 'set-params',
  match: (cmd) => /^params\s/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    const res = handleParamsCommand(action, cmdchar, put, store)
    put(frames.add({...action, ...res, type: 'params', params: getParams(store.getState())}))
  }
}, {
  name: 'params',
  match: (cmd) => /^params$/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    put(frames.add({...action, type: 'params', params: getParams(store.getState())}))
  }
}, {
  name: 'cypher',
  match: (cmd) => /^cypher$/.test(cmd),
  exec: (action, cmdchar, put, store) => {
    const [id, request] = handleCypherCommand(action, put, getParams(store.getState()))
    put(frames.add({...action, type: 'cypher', requestId: id}))
    return request
      .then((res) => {
        put(updateQueryResult(id, res, 'success'))
        return res
      })
      .catch(function (e) {
        put(updateQueryResult(id, e, 'error'))
        throw e
      })
  }
}, {
  name: 'server',
  match: (cmd) => /^server(\s)/.test(cmd),
  exec: (action, cmdchar, put, store) => {
    const response = handleServerCommand(action, cmdchar, put, store)
    if (response && response.then) {
      response.then((res) => {
        if (res) put(frames.add({...action, ...res}))
      })
    } else if (response) {
      put(frames.add({...action, ...response}))
    }
    return response
  }
}, {
  name: 'play-remote',
  match: (cmd) => /^play(\s|$)https?/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    const url = action.cmd.substr(cmdchar.length + 'play '.length)
    try {
      remote.get(url).then((r) => {
        put(frames.add({...action, type: 'play-remote', result: cleanHtml(r)}))
      })
    } catch (e) {
      put(frames.add({...action, type: 'play-remote', error: CouldNotFetchRemoteGuideError(e)}))
    }
  }
}, {
  name: 'play',
  match: (cmd) => /^play(\s|$)/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    put(frames.add({...action, type: 'play'}))
  }
}, {
  name: 'history',
  match: (cmd) => cmd === 'history',
  exec: function (action, cmdchar, put, store) {
    const historyState = getHistory(store.getState())
    const newAction = frames.add({ ...action, result: historyState, type: 'history' })
    put(newAction)
    return newAction
  }
}, {
  name: 'help',
  match: (cmd) => /^help(\s|$)/.test(cmd),
  exec: function (action, cmdchar, put, store) {
    put(frames.add({...action, type: 'help'}))
  }
}, {
  name: 'catch-all',
  match: () => true,
  exec: (action, cmdchar, put) => {
    put(frames.add({...action, type: 'unknown', error: UnknownCommandError(action.cmd)}))
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
