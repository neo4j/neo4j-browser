import 'babel-polyfill'
import { createEpicMiddleware } from 'redux-observable'
import 'preact/devtools'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { applyMiddleware as applySuberMiddleware, createReduxMiddleware as createSuberReduxMiddleware } from 'suber'

import reducers from 'shared/rootReducer'
import connectionsReducer from 'shared/modules/connections/connectionsDuck'
import App from './modules/App/App'

import epics from 'shared/rootEpic'
import './styles/style.css'
import './styles/codemirror.css'
import './styles/bootstrap.grid-only.min.css'
import 'grommet/grommet.min.css'
import lStorage from 'browser-services/localstorage'
import { makeConnectionsPersistedState, makeConnectionsInitialState } from 'browser-services/localstorageMiddleware'

const suberMiddleware = createSuberReduxMiddleware()
const epicMiddleware = createEpicMiddleware(epics)

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})

const enhancer = compose(
  applyMiddleware(suberMiddleware, epicMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)

const persistedStateKeys = ['connections', 'settings', 'history', 'favorites', 'visualization', 'datasource']
const persistedStateStorage = window.localStorage

const localStoragePersistStateMiddleware = lStorage.applyMiddleware(
  makeConnectionsPersistedState()
)
const localStorageInitialStateMiddleware = lStorage.applyMiddleware(
  makeConnectionsInitialState(connectionsReducer)
)

const store = createStore(
  reducer,
  lStorage.getStorageForKeys(
    persistedStateKeys,
    persistedStateStorage,
    localStorageInitialStateMiddleware
  ),
  enhancer
)
store.subscribe(lStorage.createPersistingStoreListener(
  store,
  persistedStateKeys,
  persistedStateStorage,
  localStoragePersistStateMiddleware
))

const history = syncHistoryWithStore(browserHistory, store)

// Send everything from suber into Redux
applySuberMiddleware((_) => (channel, message, source) => {
  // No loop-backs
  if (source === 'redux') return
  // Send to Redux with the channel as the action type
  store.dispatch({...message, type: channel})
})
store.dispatch({ type: 'APP_START' })
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App} />
    </Router>
  </Provider>,
  document.getElementById('mount')
)
