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

import './init.js'
import { createEpicMiddleware } from 'redux-observable'
import { render } from 'preact'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'preact-redux'
import {
  createBus,
  createReduxMiddleware as createSuberReduxMiddleware
} from 'suber'
import { BusProvider } from 'preact-suber'

import reducers from 'shared/rootReducer'
import epics from 'shared/rootEpic'

import { createReduxMiddleware, getAll, applyKeys } from 'services/localstorage'
import { APP_START, DESKTOP, WEB } from 'shared/modules/app/appDuck'

// Configure localstorage sync
applyKeys(
  'connections',
  'settings',
  'history',
  'documents',
  'folders',
  'grass',
  'syncConsent',
  'udc'
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
  window.devToolsExtension ? window.devToolsExtension() : f => f
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

// Introduce environment to be able to fork funtionality
const env = window && window.neo4jDesktopApi ? DESKTOP : WEB

// Signal app upstart (for epics)
store.dispatch({ type: APP_START, url: window.location.href, env })

const mountElement = document.getElementById('mount')
let elem
const renderApp = () => {
  const App = require('./modules/App/App').default
  elem = render(
    <Provider store={store}>
      <BusProvider bus={bus}>
        <App
          desktopIntegrationPoint={
            window && window.neo4jDesktopApi ? window.neo4jDesktopApi : null
          }
        />
      </BusProvider>
    </Provider>,
    mountElement,
    elem
  )
}
renderApp()

if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept('./modules/App/App', renderApp)
  }
}
