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

import { Action, MiddlewareAPI } from 'redux'
import { ActionsObservable, Epic } from 'redux-observable'
import { v4 } from 'uuid'
import { USER_CLEAR } from '../app/appDuck'
import { GlobalState } from 'shared/globalState'
import {
  AUTHORIZED,
  CLEAR_SYNC,
  CLEAR_SYNC_AND_LOCAL
} from 'shared/modules/sync/syncDuck'
import {
  getVersion,
  getStoreId,
  isBeta
} from 'shared/modules/dbMeta/dbMetaDuck'
import {
  TRACK_CANNY_FEATURE_REQUEST,
  TRACK_CANNY_CHANGELOG
} from 'shared/modules/sidebar/sidebarDuck'
import {
  ADD,
  PIN,
  REMOVE,
  TRACK_COLLAPSE_TOGGLE,
  TRACK_FULLSCREEN_TOGGLE,
  TRACK_SAVE_AS_PROJECT_FILE,
  UNPIN
} from 'shared/modules/stream/streamDuck'
import {
  CYPHER_SUCCEEDED,
  CYPHER_FAILED,
  COMMAND_QUEUED
} from 'shared/modules/commands/commandsDuck'
import {
  ADD_FAVORITE,
  LOAD_FAVORITES,
  UPDATE_FAVORITE_CONTENT,
  REMOVE_FAVORITE,
  getFavorites
} from 'shared/modules/favorites/favoritesDuck'
import {
  shouldReportUdc,
  getSettings,
  TRACK_OPT_OUT_CRASH_REPORTS,
  TRACK_OPT_OUT_USER_STATS
} from 'shared/modules/settings/settingsDuck'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'
import { shouldTriggerConnectEvent, getTodayDate } from './udcHelpers'
import api from 'services/intercom'
import cmdHelper from 'shared/services/commandInterpreterHelper'
import { extractStatementsFromString } from 'services/commandUtils'
import { isGuideChapter, isPlayChapter } from 'browser/documentation'

// Action types
export const NAME = 'udc'
const INCREMENT = 'udc/INCREMENT'
const EVENT_QUEUE = 'udc/EVENT_QUEUE'
const EVENT_FIRED = 'udc/EVENT_FIRED'
const CLEAR_EVENTS = 'udc/CLEAR_EVENTS'
const UPDATE_DATA = 'udc/UPDATE_DATA'
const BOOTED = 'udc/BOOTED'
export const METRICS_EVENT = 'udc/METRICS_EVENT'
export const UDC_STARTUP = 'udc/STARTUP'
export const LAST_GUIDE_SLIDE = 'udc/LAST_GUIDE_SLIDE'

let booted = false

// Event constants
export const EVENT_APP_STARTED = 'EVENT_APP_STARTED'
export const EVENT_BROWSER_SYNC_LOGOUT = 'EVENT_BROWSER_SYNC_LOGOUT'
export const EVENT_BROWSER_SYNC_LOGIN = 'EVENT_BROWSER_SYNC_LOGIN'
export const EVENT_DRIVER_CONNECTED = 'EVENT_DRIVER_CONNECTED'

type TrackedEventOccurrenceTypes =
  | 'cypher_wins'
  | 'cypher_fails'
  | 'client_starts'

const typeToEventName: { [key: string]: TrackedEventOccurrenceTypes } = {
  [CYPHER_SUCCEEDED]: 'cypher_wins',
  [CYPHER_FAILED]: 'cypher_fails',
  [EVENT_APP_STARTED]: 'client_starts'
}

export const typeToMetricsObject = {
  [CYPHER_SUCCEEDED]: { category: 'cypher', label: 'succeeded' },
  [CYPHER_FAILED]: { category: 'cypher', label: 'failed' },
  [EVENT_APP_STARTED]: { category: 'app', label: 'started' },
  [EVENT_DRIVER_CONNECTED]: { category: 'driver', label: 'connected' },
  [EVENT_BROWSER_SYNC_LOGOUT]: {
    category: 'browser_sync',
    label: 'logged_out'
  },
  [EVENT_BROWSER_SYNC_LOGIN]: { category: 'browser_sync', label: 'logged_in' }
}

// Selectors
const getData = (state: GlobalState) => {
  const { events, ...rest } = state[NAME] || initialState
  return rest
}
const getLastSnapshotTime = (state: GlobalState) =>
  (state[NAME] && state[NAME].lastSnapshot) || initialState.lastSnapshot
const getName = (state: GlobalState) => state[NAME].name || 'Graph Friend'
const getCompanies = (state: GlobalState) => {
  if (getVersion(state) && getStoreId(state)) {
    return [
      {
        type: 'company',
        name: `Neo4j ${getVersion(state)} ${getStoreId(state)}`,
        company_id: getStoreId(state)
      }
    ]
  }
  return null
}
const getEvents = (state: GlobalState) =>
  state[NAME].events || initialState.events
export const getUuid = (state: GlobalState): string =>
  state[NAME].uuid || initialState.uuid
export const getAuraNtId = (state: GlobalState): string | undefined =>
  state[NAME].auraNtId
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

interface udcEvent {
  name: string
  data: unknown
}

export interface udcState {
  events: udcEvent[]
  lastSnapshot: number
  name?: string
  uuid: string
  created_at: number
  client_starts: number
  cypher_wins: number
  cypher_fails: number
  pingTime: number
  auraNtId?: string
  consentBannerShownCount: number
  desktopTrackingId?: string
  allowUserStatsInDesktop: boolean
  allowCrashReportsInDesktop: boolean
}

const initialState: udcState = {
  uuid: v4(),
  created_at: Math.round(Date.now() / 1000),
  client_starts: 0,
  cypher_wins: 0,
  cypher_fails: 0,
  pingTime: 0,
  lastSnapshot: 0,
  events: [],
  auraNtId: undefined,
  consentBannerShownCount: 0,
  desktopTrackingId: undefined,
  allowUserStatsInDesktop: false,
  allowCrashReportsInDesktop: false
}

type CleatEventsAction = { type: typeof CLEAR_EVENTS }
type BootedAction = { type: typeof BOOTED }

type udcActionsUnion =
  | IncrementAction
  | AddToEventQueueAction
  | CleatEventsAction
  | UpdateDataAction
  | BootedAction

// Reducer
export default function reducer(
  state = initialState,
  action: udcActionsUnion
): udcState {
  switch (action.type) {
    case INCREMENT:
      return { ...state, [action.what]: (state[action.what] || 0) + 1 }
    case EVENT_QUEUE:
      return {
        ...state,
        events: (state.events || []).concat(action.event).slice(-100)
      }
    case CLEAR_EVENTS:
      return { ...state, events: [] }
    case USER_CLEAR:
      return { ...initialState, uuid: state.uuid || initialState.uuid }
    case UPDATE_DATA:
      const { type, ...rest } = action
      return { ...state, ...rest }
    default:
      return state
  }
}

interface IncrementAction {
  type: typeof INCREMENT
  what: TrackedEventOccurrenceTypes
}

// Action creators
const increment = (what: TrackedEventOccurrenceTypes): IncrementAction => {
  return {
    type: INCREMENT,
    what
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

interface AddToEventQueueAction {
  type: typeof EVENT_QUEUE
  event: udcEvent
}

export const addToEventQueue = (
  name: string,
  data: unknown
): AddToEventQueueAction => {
  return {
    type: EVENT_QUEUE,
    event: {
      name,
      data
    }
  }
}

interface EventFiredAction {
  type: typeof EVENT_FIRED
  name: string
  data: unknown
}

const eventFired = (name: string, data: unknown = null): EventFiredAction => {
  return {
    type: EVENT_FIRED,
    name,
    data
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

interface UpdateDataAction extends Partial<udcState> {
  type: typeof UPDATE_DATA
}

export const updateUdcData = (obj: Partial<udcState>): UpdateDataAction => {
  return {
    type: UPDATE_DATA,
    ...obj
  }
}

function aWeekSinceLastSnapshot(store: MiddlewareAPI<GlobalState>) {
  const now = Math.round(Date.now() / 1000)
  const lastSnapshot = getLastSnapshotTime(store.getState())
  const aWeekInSeconds = 60 * 60 * 24 * 7
  return now - lastSnapshot > aWeekInSeconds
}

// Epics
export const udcStartupEpic: Epic<Action, GlobalState> = (action$, store) =>
  action$
    .ofType(UDC_STARTUP)
    .do(() =>
      store.dispatch(metricsEvent(typeToMetricsObject[EVENT_APP_STARTED]))
    )
    .do(() => {
      if (!aWeekSinceLastSnapshot(store)) {
        return
      }

      const settings = getSettings(store.getState())
      const nonSensitiveSettings = [
        'cmdchar',
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
    .mapTo(increment(typeToEventName[EVENT_APP_STARTED]))

export const incrementEventEpic: Epic<Action, GlobalState> = (action$, store) =>
  action$
    .ofType(CYPHER_FAILED)
    .merge(action$.ofType(CYPHER_SUCCEEDED))
    .do(action =>
      store.dispatch(metricsEvent(typeToMetricsObject[action.type]))
    )
    .map(action => increment(typeToEventName[action.type]))

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
      extraData.content = isGuideChapter(guideName)
        ? 'built-in'
        : 'non-built-in'
    }

    return metricsEvent({
      category: 'command',
      label: 'non-cypher',
      data: { source: action.source || 'unknown', type, ...extraData }
    })
  })

export const trackSyncLogoutEpic: Epic<Action, GlobalState> = (
  action$,
  store
) =>
  action$
    .ofType(CLEAR_SYNC)
    .merge(action$.ofType(CLEAR_SYNC_AND_LOCAL))
    .do(() =>
      store.dispatch(
        metricsEvent(typeToMetricsObject[EVENT_BROWSER_SYNC_LOGOUT])
      )
    )
    .map(() => eventFired('syncLogout'))

export const bootEpic: Epic<Action, GlobalState> = (action$, store) => {
  return action$
    .ofType(AUTHORIZED) // Browser sync auth
    .do(() =>
      store.dispatch(
        metricsEvent(typeToMetricsObject[EVENT_BROWSER_SYNC_LOGIN])
      )
    )
    .map((action: any) => {
      // Store name locally
      if (!action.userData || !action.userData.name) return action
      store.dispatch(updateUdcData({ name: action.userData.name }))
      return action
    })
    .map((action: any) => {
      if (booted) return false
      if (!action.userData || !action.userData.user_id) return false // No info
      if (!isBeta(store.getState()) && !shouldReportUdc(store.getState())) {
        // No opt out of pre releases
        api('boot', { user_id: action.userData.user_id })
      } else {
        api('boot', {
          ...getData(store.getState()),
          companies: getCompanies(store.getState()),
          neo4j_version: getVersion(store.getState()),
          user_id: action.userData.user_id
        })
        api('trackEvent', 'syncAuthenticated', {
          // Track that user connected to browser sync
          user_id: action.userData.user_id,
          name: getName(store.getState())
        })
        const waitingEvents = getEvents(store.getState())
        waitingEvents.forEach(
          event => event && api('trackEvent', event.name, event.data)
        )
        store.dispatch({ type: CLEAR_EVENTS })
      }
      booted = true
      return true
    })
    .map(didBoot => {
      return didBoot ? { type: BOOTED } : { type: 'NOOP' }
    })
}

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

export const trackConnectsEpic: Epic<Action, GlobalState> = (action$, store) =>
  action$
    .ofType(CONNECTION_SUCCESS)
    .merge(action$.ofType(BOOTED))
    .do(() =>
      store.dispatch(metricsEvent(typeToMetricsObject[EVENT_DRIVER_CONNECTED]))
    )
    .map(() => {
      const state = store.getState()
      const data = {
        store_id: getStoreId(state),
        neo4j_version: getVersion(state),
        client_starts: state[NAME] ? state[NAME].client_starts : 0,
        cypher_wins: state[NAME] ? state[NAME].cypher_wins : 0,
        cypher_fails: state[NAME] ? state[NAME].cypher_fails : 0
      }
      return eventFired('connect', data)
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

export const eventFiredEpic: Epic<any, GlobalState> = (
  action$: ActionsObservable<EventFiredAction>,
  store // Decide what to do with events
) =>
  action$.ofType(EVENT_FIRED).map((action: EventFiredAction) => {
    if (
      action.name === 'connect' &&
      !shouldTriggerConnectEvent(store.getState()[NAME])
    ) {
      return { type: 'NOOP' }
    }
    if (!booted) return addToEventQueue(action.name, action.data)
    if (!isBeta(store.getState()) && !shouldReportUdc(store.getState())) {
      return addToEventQueue(action.name, action.data)
    }
    api('trackEvent', action.name, action.data)
    if (action.name === 'connect') {
      return updateUdcData({ pingTime: getTodayDate().getTime() })
    }
    return { type: 'NOOP' }
  })
