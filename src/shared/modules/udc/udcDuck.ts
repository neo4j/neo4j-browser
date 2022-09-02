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
import { v4 } from 'uuid'

import { USER_CLEAR } from '../app/appDuck'
import { CONNECT, CONNECTION_SUCCESS } from '../connections/connectionsDuck'
import { isBuiltInGuide, isPlayChapter } from 'browser/documentation'
import { GlobalState } from 'shared/globalState'
import {
  COMMAND_QUEUED,
  CYPHER_FAILED,
  CYPHER_SUCCEEDED
} from 'shared/modules/commands/commandsDuck'
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

// Action types
export const NAME = 'udc'
const UPDATE_DATA = 'udc/UPDATE_DATA'
export const GENERATE_SET_MISSING_PARAMS_TEMPLATE =
  'udc/GENERATE_SET_MISSING_PARAMS_TEMPLATE'
export const METRICS_EVENT = 'udc/METRICS_EVENT'
export const UDC_STARTUP = 'udc/STARTUP'
export const LAST_GUIDE_SLIDE = 'udc/LAST_GUIDE_SLIDE'

export const getAuraNtId = (state: GlobalState): string | undefined =>
  state[NAME].auraNtId
export const getUuid = (state: GlobalState): string =>
  state[NAME].uuid || initialState.uuid
export const getDesktopTrackingId = (state: GlobalState): string | undefined =>
  state[NAME].desktopTrackingId
export const getAllowUserStatsInDesktop = (state: GlobalState): boolean =>
  state[NAME].allowUserStatsInDesktop ?? initialState.allowUserStatsInDesktop
export const getAllowCrashReportsInDesktop = (state: GlobalState): boolean =>
  state[NAME].allowCrashReportsInDesktop ??
  initialState.allowCrashReportsInDesktop
export const getConsentBannerShownCount = (state: GlobalState): number =>
  state[NAME].consentBannerShownCount || initialState.consentBannerShownCount
export const allowUdcInAura = (
  state: GlobalState
): 'ALLOW' | 'DENY' | 'UNSET' => {
  const ntId = state[NAME].auraNtId
  if (typeof ntId === 'string') {
    // Set to empty empty string to disable
    if (ntId === '') {
      return 'DENY'
    } else {
      return 'ALLOW'
    }
  }

  return 'UNSET'
}
const getLastSnapshotTime = (state: GlobalState) =>
  (state[NAME] && state[NAME].lastSnapshot) || initialState.lastSnapshot

const aWeekSinceLastSnapshot = (state: GlobalState) => {
  const now = Math.round(Date.now() / 1000)
  const lastSnapshot = getLastSnapshotTime(state)
  const aWeekInSeconds = 60 * 60 * 24 * 7
  return now - lastSnapshot > aWeekInSeconds
}

export interface UdcState {
  lastSnapshot: number
  auraNtId?: string
  uuid: string
  consentBannerShownCount: number
  desktopTrackingId?: string
  allowUserStatsInDesktop: boolean
  allowCrashReportsInDesktop: boolean
}

const initialState: UdcState = {
  lastSnapshot: 0,
  auraNtId: undefined,
  uuid: v4(),
  consentBannerShownCount: 0,
  desktopTrackingId: undefined,
  allowUserStatsInDesktop: false,
  allowCrashReportsInDesktop: false
}

// Reducer
export default function reducer(
  state = initialState,
  action: UpdateDataAction | { type: typeof USER_CLEAR }
): UdcState {
  switch (action.type) {
    case USER_CLEAR:
      return { ...initialState }
    case UPDATE_DATA:
      const { type, ...rest } = action
      return { ...state, ...rest }
    default:
      return state
  }
}
interface UdcInitAction {
  type: typeof UDC_STARTUP
}

export const udcInit = (): UdcInitAction => {
  return {
    type: UDC_STARTUP
  }
}

interface MetricsEvent {
  category: string
  label: string
  data?: unknown
}

interface MetricsEventAction extends MetricsEvent {
  type: typeof METRICS_EVENT
}

const metricsEvent = (payload: MetricsEvent): MetricsEventAction => {
  return {
    type: METRICS_EVENT,
    ...payload
  }
}

interface UpdateDataAction extends Partial<UdcState> {
  type: typeof UPDATE_DATA
}

export const updateUdcData = (obj: Partial<UdcState>): UpdateDataAction => {
  return {
    type: UPDATE_DATA,
    ...obj
  }
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
    .ignoreElements()

export const trackCommandUsageEpic: Epic<Action, GlobalState> = action$ =>
  action$.ofType(COMMAND_QUEUED).map((action: any) => {
    const cmd: string = action.cmd
    const isCypher = !cmd.startsWith(':')
    const estimatedNumberOfStatements = cmd.split(';').filter(a => a).length
    if (isCypher) {
      return metricsEvent({
        category: 'command',
        label: 'cypher',
        data: {
          type: 'cypher',
          source: action.source || 'unknown',
          averageWordCount: cmd.split(' ').length / estimatedNumberOfStatements,
          averageLineCount:
            cmd.split('\n').length / estimatedNumberOfStatements,
          estimatedNumberOfStatements
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
  GENERATE_SET_MISSING_PARAMS_TEMPLATE,
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
  TRACK_OPT_OUT_CRASH_REPORTS,
  CONNECT,
  CONNECTION_SUCCESS,
  CYPHER_SUCCEEDED,
  CYPHER_FAILED
]
export const trackReduxActionsEpic: Epic<Action, GlobalState> = action$ =>
  action$
    .filter(action => actionsOfInterest.includes(action.type))
    .map(action => {
      const [category, label] = action.type.split('/')
      return metricsEvent({ category, label })
    })

export const trackErrorFramesEpic: Epic<Action, GlobalState> = (
  action$,
  store
) =>
  action$
    .ofType(ADD)
    .do((action: any) => {
      const error = action.state.error
      if (error) {
        const { code, type } = error
        store.dispatch(
          metricsEvent({
            category: 'stream',
            label: 'errorframe',
            data: { code, type }
          })
        )
      }
    })
    .ignoreElements()
