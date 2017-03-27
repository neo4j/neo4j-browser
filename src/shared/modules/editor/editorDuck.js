import Rx from 'rxjs/Rx'
import { getUrlParamValue } from 'services/utils'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import { APP_START } from 'shared/modules/app/appDuck'

const NAME = 'editor'
export const SET_CONTENT = NAME + '/SET_CONTENT'
export const FOCUS = `${NAME}/FOCUS`

export const setContent = (newContent) => ({ message: newContent })

export const populateEditorFromUrlEpic = (some$, store) => {
  return some$.ofType(APP_START)
    .delay(1) // Timing issue. Needs to be detached like this
    .mergeMap(() => {
      const cmdParam = getUrlParamValue('cmd', window.location.href)
      if (!cmdParam || cmdParam[0] !== 'play') return Rx.Observable.never()
      const cmdCommand = getSettings(store.getState()).cmdchar + cmdParam[0]
      const cmdArgs = getUrlParamValue('arg', decodeURIComponent(window.location.href)) || []
      const fullCommand = `${cmdCommand} ${cmdArgs.join(' ')}`
      return Rx.Observable.of({ type: SET_CONTENT, ...setContent(fullCommand) })
    })
}
