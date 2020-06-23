/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import { v4 } from 'uuid'
import { APP_START, USER_CLEAR } from '../app/appDuck'
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
  CYPHER,
  CYPHER_SUCCEEDED,
  CYPHER_FAILED
} from 'shared/modules/commands/commandsDuck'
import { shouldReportUdc } from 'shared/modules/settings/settingsDuck'
import { CONNECTION_SUCCESS } from 'shared/modules/connections/connectionsDuck'
import { shouldTriggerConnectEvent, getTodayDate } from './udcHelpers'
import api from 'services/intercom'

// Action types
export const NAME = 'udc'
export const INCREMENT = `${NAME}/INCREMENT`
export const CONNECT = `${NAME}/CONNECT`
export const EVENT_QUEUE = `${NAME}/EVENT_QUEUE`
export const EVENT_FIRED = `${NAME}/EVENT_FIRED`
export const CLEAR_EVENTS = `${NAME}/CLEAR_EVENTS`
export const UPDATE_SETTINGS = `${NAME}/UPDATE_SETTINGS`
export const UPDATE_DATA = `${NAME}/UPDATE_DATA`
export const BOOTED = `${NAME}/BOOTED`
export const METRICS_EVENT = `${NAME}/METRICS_EVENT`

let booted = false

// Event constants
export const EVENT_APP_STARTED = 'EVENT_APP_STARTED'
export const EVENT_BROWSER_SYNC_LOGOUT = 'EVENT_BROWSER_SYNC_LOGOUT'
export const EVENT_BROWSER_SYNC_LOGIN = 'EVENT_BROWSER_SYNC_LOGIN'
export const EVENT_DRIVER_CONNECTED = 'EVENT_DRIVER_CONNECTED'

const typeToEventName = {
  [CYPHER]: 'cypher_attempts',
  [CYPHER_SUCCEEDED]: 'cypher_wins',
  [CYPHER_FAILED]: 'cypher_fails',
  [EVENT_APP_STARTED]: 'client_starts'
}

export const typeToMetricsObject = {
  [CYPHER]: { category: 'cypher', label: 'sent' },
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
const getData = state => {
  const { events, ...rest } = state[NAME] || initialState // eslint-disable-line
  return rest
}
const getName = state => state[NAME].name || 'Graph Friend'
const getCompanies = state => {
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
const getEvents = state => state[NAME].events || initialState.events

const initialState = {
  uuid: v4(),
  created_at: Math.round(Date.now() / 1000),
  client_starts: 0,
  cypher_attempts: 0,
  cypher_wins: 0,
  cypher_fails: 0,
  pingTime: 0,
  events: []
}

// Reducer
export default function reducer(state = initialState, action) {
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
      return initialState
    case UPDATE_DATA:
      const { type, ...rest } = action // eslint-disable-line
      return { ...state, ...rest }
    default:
      return state
  }
}

// Action creators
const increment = what => {
  return {
    type: INCREMENT,
    what
  }
}
export const addToEventQueue = (name, data) => {
  return {
    type: EVENT_QUEUE,
    event: {
      name,
      data
    }
  }
}
const eventFired = (name, data = null) => {
  return {
    type: EVENT_FIRED,
    name,
    data
  }
}

const metricsEvent = payload => {
  return {
    type: METRICS_EVENT,
    ...payload
  }
}

export const updateData = obj => {
  return {
    type: UPDATE_DATA,
    ...obj
  }
}

// Epics
export const udcStartupEpic = (action$, store) =>
  action$
    .ofType(APP_START)
    .do(() =>
      store.dispatch(metricsEvent(typeToMetricsObject[EVENT_APP_STARTED]))
    )
    .mapTo(increment(typeToEventName[EVENT_APP_STARTED]))

export const incrementEventEpic = (action$, store) =>
  action$
    .ofType(CYPHER)
    .merge(action$.ofType(CYPHER_FAILED))
    .merge(action$.ofType(CYPHER_SUCCEEDED))
    .do(action =>
      store.dispatch(metricsEvent(typeToMetricsObject[action.type]))
    )
    .map(action => increment(typeToEventName[action.type]))

export const trackSyncLogoutEpic = (action$, store) =>
  action$
    .ofType(CLEAR_SYNC)
    .merge(action$.ofType(CLEAR_SYNC_AND_LOCAL))
    .do(() =>
      store.dispatch(
        metricsEvent(typeToMetricsObject[EVENT_BROWSER_SYNC_LOGOUT])
      )
    )
    .map(action => eventFired('syncLogout'))

export const bootEpic = (action$, store) => {
  return action$
    .ofType(AUTHORIZED) // Browser sync auth
    .do(() =>
      store.dispatch(
        metricsEvent(typeToMetricsObject[EVENT_BROWSER_SYNC_LOGIN])
      )
    )
    .map(action => {
      // Store name locally
      if (!action.userData || !action.userData.name) return action
      store.dispatch(updateData({ name: action.userData.name }))
      return action
    })
    .map(action => {
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

export const trackConnectsEpic = (
  action$,
  store // Decide what to do with events
) =>
  action$
    .ofType(CONNECTION_SUCCESS)
    .merge(action$.ofType(BOOTED))
    .do(() =>
      store.dispatch(metricsEvent(typeToMetricsObject[EVENT_DRIVER_CONNECTED]))
    )
    .map(action => {
      const state = store.getState()
      const data = {
        store_id: getStoreId(state),
        neo4j_version: getVersion(state),
        client_starts: state[NAME] ? state[NAME].client_starts : 0,
        cypher_attempts: state[NAME] ? state[NAME].cypher_attempts : 0,
        cypher_wins: state[NAME] ? state[NAME].cypher_wins : 0,
        cypher_fails: state[NAME] ? state[NAME].cypher_fails : 0
      }
      return eventFired('connect', data)
    })

export const eventFiredEpic = (
  action$,
  store // Decide what to do with events
) =>
  action$.ofType(EVENT_FIRED).map(action => {
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
      return updateData({ pingTime: getTodayDate().getTime() })
    }
    return { type: 'NOOP' }
  })
