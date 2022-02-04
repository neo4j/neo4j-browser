/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { Action } from 'redux'
import { Epic } from 'redux-observable'

import {
  LAST_GUIDE_SLIDE,
  UDC_STARTUP,
  getLastSnapshotTime,
  metricsEvent,
  updateUdcData
} from './udcDuck'
import { isBuiltInGuide, isPlayChapter } from 'browser/documentation'
import { extractStatementsFromString } from 'services/commandUtils'
import { GlobalState } from 'shared/globalState'
import { COMMAND_QUEUED } from 'shared/modules/commands/commandsDuck'
import {
  ADD_FAVORITE,
  LOAD_FAVORITES,
  REMOVE_FAVORITE,
  UPDATE_FAVORITE_CONTENT,
  getFavorites
} from 'shared/modules/favorites/favoritesDuck'
import {
  ADD,
  PIN,
  REMOVE,
  TRACK_COLLAPSE_TOGGLE,
  TRACK_FULLSCREEN_TOGGLE,
  TRACK_SAVE_AS_PROJECT_FILE,
  UNPIN
} from 'shared/modules/frames/framesDuck'
import {
  SettingsState,
  TRACK_OPT_OUT_CRASH_REPORTS,
  TRACK_OPT_OUT_USER_STATS,
  getSettings
} from 'shared/modules/settings/settingsDuck'
import {
  TRACK_CANNY_CHANGELOG,
  TRACK_CANNY_FEATURE_REQUEST
} from 'shared/modules/sidebar/sidebarDuck'
import cmdHelper from 'shared/services/commandInterpreterHelper'

const aWeekSinceLastSnapshot = (state: GlobalState) => {
  const now = Math.round(Date.now() / 1000)
  const lastSnapshot = getLastSnapshotTime(state)
  const aWeekInSeconds = 60 * 60 * 24 * 7
  return now - lastSnapshot > aWeekInSeconds
}

// Epics
export const udcStartupEpic: Epic<Action, GlobalState> = (action$, store) =>
  action$
    .ofType(UDC_STARTUP)
    .do(() => {
      if (!aWeekSinceLastSnapshot(store.getState())) {
        return
      }

      const settings = getSettings(store.getState())
      const nonSensitiveSettings: Array<keyof SettingsState> = [
        'maxHistory',
        'theme',
        'playImplicitInitCommands',
        'initialNodeDisplay',
        'maxNeighbours',
        'showSampleScripts',
        'maxRows',
        'maxFieldItems',
        'autoComplete',
        'scrollToTop',
        'maxFrames',
        'codeFontLigatures',
        'editorLint',
        'useCypherThread',
        'enableMultiStatementMode',
        'connectionTimeout'
      ]
      if (settings) {
        const data = nonSensitiveSettings.reduce(
          (acc, curr) => ({ ...acc, [curr]: settings[curr] }),
          {}
        )
        store.dispatch(
          metricsEvent({ category: 'settings', label: 'snapshot', data })
        )
      }
      const favorites = getFavorites(store.getState())

      if (favorites) {
        const count = favorites.filter(script => !script.isStatic).length
        store.dispatch(
          metricsEvent({
            category: 'favorites',
            label: 'snapshot',
            data: { count }
          })
        )
      }
      store.dispatch(
        updateUdcData({ lastSnapshot: Math.round(Date.now() / 1000) })
      )
    })
    .mapTo({ type: 'NOOP' })

export const trackCommandUsageEpic: Epic<Action, GlobalState> = action$ =>
  action$.ofType(COMMAND_QUEUED).map((action: any) => {
    const isCypher = !action.cmd.startsWith(':')
    if (isCypher) {
      const numberOfStatements =
        extractStatementsFromString(action.cmd)?.length || 1
      return metricsEvent({
        category: 'command',
        label: 'cypher',
        data: {
          type: 'cypher',
          source: action.source || 'unknown',
          averageWordCount: action.cmd.split(' ').length / numberOfStatements,
          averageLineCount: action.cmd.split('\n').length / numberOfStatements,
          numberOfStatements
        }
      })
    }

    const type = cmdHelper.interpret(action.cmd.slice(1))?.name

    const extraData: Record<string, string | number> = {}

    if (type === 'play') {
      const guideName = action.cmd.substr(':play'.length).trim()
      extraData.content = isPlayChapter(guideName) ? 'built-in' : 'non-built-in'
    } else if (type === 'guide') {
      const guideName = action.cmd.substr(':guide'.length).trim()
      extraData.content = isBuiltInGuide(guideName)
        ? 'built-in'
        : 'non-built-in'
    }

    return metricsEvent({
      category: 'command',
      label: 'non-cypher',
      data: { source: action.source || 'unknown', type, ...extraData }
    })
  })

const actionsOfInterest = [
  ADD_FAVORITE,
  LAST_GUIDE_SLIDE,
  LOAD_FAVORITES,
  PIN,
  REMOVE_FAVORITE,
  REMOVE,
  TRACK_COLLAPSE_TOGGLE,
  TRACK_FULLSCREEN_TOGGLE,
  TRACK_SAVE_AS_PROJECT_FILE,
  UDC_STARTUP,
  UNPIN,
  UPDATE_FAVORITE_CONTENT,
  TRACK_CANNY_FEATURE_REQUEST,
  TRACK_CANNY_CHANGELOG,
  TRACK_OPT_OUT_USER_STATS,
  TRACK_OPT_OUT_CRASH_REPORTS
]
export const trackReduxActionsEpic: Epic<Action, GlobalState> = action$ =>
  action$
    .filter(action => actionsOfInterest.includes(action.type))
    .map(action => {
      const [category, label] = action.type.split('/')
      return metricsEvent({ category, label })
    })

export const trackErrorFramesEpic: Epic<Action, GlobalState> = action$ =>
  action$.ofType(ADD).map((action: any) => {
    const error = action.state.error
    if (error) {
      const { code, type } = error
      return metricsEvent({
        category: 'stream',
        label: 'errorframe',
        data: { code, type }
      })
    } else {
      return { type: 'NOOP' }
    }
  })
