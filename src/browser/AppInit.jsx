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

import React from 'react'
import { createEpicMiddleware } from 'redux-observable'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import {
  createBus,
  createReduxMiddleware as createSuberReduxMiddleware
} from 'suber'
import { BusProvider } from 'react-suber'
import App from './modules/App/App'
import reducers from 'shared/rootReducer'
import epics from 'shared/rootEpic'

import { createReduxMiddleware, getAll, applyKeys } from 'services/localstorage'
import { APP_START } from 'shared/modules/app/appDuck'
import { GlobalStyle } from './styles/global-styles.js'
import { detectRuntimeEnv } from 'services/utils.js'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck.js'

// Configure localstorage sync
applyKeys(
  'connections',
  'settings',
  'history',
  'documents',
  'folders',
  'grass',
  'syncConsent',
  'udc',
  'experimentalFeatures'
)

// Create suber bus
const bus = createBus()
// Define Redux middlewares
const suberMiddleware = createSuberReduxMiddleware(bus)
const epicMiddleware = createEpicMiddleware(epics)
const localStorageMiddleware = createReduxMiddleware()

const reducer = combineReducers({ ...reducers })

const enhancer = compose(
  applyMiddleware(suberMiddleware, epicMiddleware, localStorageMiddleware),
  process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f
)

const store = createStore(
  reducer,
  getAll(), // rehydrate from local storage on app start
  enhancer
)

// Send everything from suber into Redux
bus.applyMiddleware((_, origin) => (channel, message, source) => {
  // No loop-backs
  if (source === 'redux') return
  // Send to Redux with the channel as the action type
  store.dispatch({ ...message, type: channel, ...origin })
})

// Introduce environment to be able to fork functionality
const env = detectRuntimeEnv(window, NEO4J_CLOUD_DOMAINS)

// URL we're on
const url = window.location.href

// Signal app upstart (for epics)
store.dispatch({ type: APP_START, url, env })

const AppInit = () => {
  return (
    <Provider store={store}>
      <BusProvider bus={bus}>
        <>
          <GlobalStyle />
          <App />
        </>
      </BusProvider>
    </Provider>
  )
}
export default AppInit
