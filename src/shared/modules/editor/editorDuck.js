/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Rx from 'rxjs/Rx'
import { getUrlParamValue } from 'services/utils'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import { APP_START } from 'shared/modules/app/appDuck'

const NAME = 'editor'
export const SET_CONTENT = NAME + '/SET_CONTENT'
export const EDIT_CONTENT = NAME + '/EDIT_CONTENT'
export const FOCUS = `${NAME}/FOCUS`
export const EXPAND = `${NAME}/EXPAND`

export const setContent = newContent => ({
  type: SET_CONTENT,
  message: newContent
})
export const editContent = (id, message) => ({
  type: EDIT_CONTENT,
  message,
  id
})

export const populateEditorFromUrlEpic = (some$, store) => {
  return some$
    .ofType(APP_START)
    .delay(1) // Timing issue. Needs to be detached like this
    .mergeMap(action => {
      if (!action.url) return Rx.Observable.never()
      const cmdParam = getUrlParamValue('cmd', action.url)
      if (!cmdParam || cmdParam[0] !== 'play') return Rx.Observable.never()
      const cmdCommand = getSettings(store.getState()).cmdchar + cmdParam[0]
      const cmdArgs =
        getUrlParamValue('arg', decodeURIComponent(action.url)) || []
      const fullCommand = `${cmdCommand} ${cmdArgs.join(' ')}`
      return Rx.Observable.of({ type: SET_CONTENT, ...setContent(fullCommand) })
    })
}
