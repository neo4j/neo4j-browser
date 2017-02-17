import 'rxjs'
import { cleanCommand } from 'services/commandUtils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { getSettings } from '../settings/settingsDuck'

const NAME = 'commands'
export const USER_COMMAND_QUEUED = NAME + '/USER_COMMAND_QUEUED'

export const executeCommand = (cmd, contextId, requestId = null) => {
  return {
    type: USER_COMMAND_QUEUED,
    cmd,
    id: contextId,
    requestId
  }
}

// Epics
export const handleCommandsEpic = (action$, store) =>
  action$.ofType(USER_COMMAND_QUEUED)
    .do((action) => store.dispatch(addHistory({cmd: action.cmd})))
    .mergeMap((action) => {
      const cleanCmd = cleanCommand(action.cmd)
      const settingsState = getSettings(store.getState())
      let interpreted = helper.interpret('cypher')// assume cypher
      if (cleanCmd[0] === settingsState.cmdchar) { // :command
        interpreted = helper.interpret(action.cmd.substr(settingsState.cmdchar.length))
      }
      return new Promise((resolve, reject) => {
        const res = interpreted.exec(action, settingsState.cmdchar, store.dispatch, store)
        const noop = { type: 'NOOP' }
        if (!res || !res.then) {
          resolve(noop)
        } else {
          res
            .then((r) => resolve(noop))
            .catch((e) => resolve(noop))
        }
      })
    })
