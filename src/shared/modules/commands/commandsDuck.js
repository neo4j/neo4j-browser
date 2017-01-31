import Rx from 'rxjs'
import { cleanCommand } from 'services/commandUtils'
import helper from 'services/commandInterpreterHelper'
import { addHistory } from '../history/historyDuck'
import { getSettings } from '../settings/settingsDuck'

const NAME = 'commands'
export const USER_COMMAND_QUEUED = NAME + '/USER_COMMAND_QUEUED'

export const executeCommand = (cmd, contextId) => {
  return {
    type: USER_COMMAND_QUEUED,
    cmd,
    id: contextId
  }
}

const put = (dispatch) => (action) => dispatch(action)

export const handleCommandsEpic = (action$, store) =>
  action$.ofType(USER_COMMAND_QUEUED)
    .mergeMap((action) => {
      const cleanCmd = cleanCommand(action.cmd)
      const settingsState = getSettings(store.getState())
      let out = null
      if (cleanCmd[0] === settingsState.cmdchar) {
        const interpreted = helper.interpret(action.cmd.substr(settingsState.cmdchar.length))
        interpreted.exec(action, settingsState.cmdchar, put(store.dispatch), store)
      }
      out = Rx.Observable.of({ type: 'GOT_IT', cmd: action.cmd })
      return Rx.Observable.concat(
        out,
        Rx.Observable.of(addHistory({cmd: action.cmd}))
      )
    }
    )

