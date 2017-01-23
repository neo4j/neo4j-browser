import { call, put, select } from 'redux-saga/effects'
import * as settings from '../../shared/modules/settings/settingsDuck'
import { getSettings } from '../../selectors'
import { parseConfigInput } from 'services/commandUtils'

export function * handleConfigCommand (action, cmdchar, onSuccess, onError) {
  const strippedCmd = action.cmd.substr(cmdchar.length)
  const toBeSet = parseConfigInput(strippedCmd)
  if (strippedCmd === 'config' || toBeSet === false) {
    const settingsState = yield select(getSettings)
    const res = JSON.stringify(settingsState, null, 2)
    yield call(onSuccess, {...action, type: 'pre'}, res)
    return
  }
  yield put(settings.update(toBeSet))
  const settingsState = yield select(getSettings)
  const res = JSON.stringify(settingsState, null, 2)
  yield call(onSuccess, {...action, type: 'pre'}, res)
}
