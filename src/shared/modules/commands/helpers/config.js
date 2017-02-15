import { getSettings, update } from 'shared/modules/settings/settingsDuck'
import { parseConfigInput } from 'services/commandUtils'

export function handleGetConfigCommand (action, cmdchar, store) {
  const settingsState = getSettings(store.getState())
  const res = JSON.stringify(settingsState, null, 2)
  return { result: res, type: 'pre' }
}

export function handleUpdateConfigCommand (action, cmdchar, put, store) {
  const strippedCmd = action.cmd.substr(cmdchar.length)
  const toBeSet = parseConfigInput(strippedCmd)
  put(update(toBeSet))
}
