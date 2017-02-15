import * as frames from 'shared/modules/stream/streamDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { cleanHtml } from 'services/remoteUtils'
import remote from 'services/remote'
import { handleServerCommand } from 'shared/modules/commands/helpers/server'
import { handleCypherCommand } from 'shared/modules/commands/helpers/cypher'
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
  name: 'cypher',
  match: (cmd) => /^cypher$/.test(cmd),
  exec: (action, cmdchar, put, store) => {
    const response = handleCypherCommand(action)
    if (response.then) {
      response.then((res) => put(frames.add({...action, ...res})))
    } else {
      const newAction = frames.add({...action, ...response})
      put(newAction)
      return newAction
    }
  }
}, {
  name: 'server',
  match: (cmd) => /^server(\s)/.test(cmd),
  exec: (action, cmdchar, put, store) => {
    const response = handleServerCommand(action, cmdchar, put, store)
    if (response) put(frames.add({...action, ...response}))
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
