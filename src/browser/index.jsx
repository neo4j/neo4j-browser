import 'babel-polyfill'
import { createEpicMiddleware } from 'redux-observable'
import 'preact/devtools'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { applyMiddleware as applySuberMiddleware, createReduxMiddleware as createSuberReduxMiddleware } from 'suber'

import reducers from 'shared/rootReducer'
import App from './modules/App/App'

import epics from 'shared/rootEpic'
import './styles/style.css'
import './styles/codemirror.css'
import './styles/bootstrap.grid-only.min.css'
import lStorage from 'browser-services/localstorage'

const suberMiddleware = createSuberReduxMiddleware()
const epicMiddleware = createEpicMiddleware(epics)

const reducer = combineReducers({ ...reducers })

const enhancer = compose(
  applyMiddleware(suberMiddleware, epicMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)

const persistedStateKeys = ['connections', 'settings', 'history', 'favorites']
const persistedStateStorage = window.localStorage

const store = createStore(
  reducer,
  lStorage.getStorageForKeys(
    persistedStateKeys,
    persistedStateStorage
  ),
  enhancer
)
store.subscribe(lStorage.createPersistingStoreListener(
  store,
  persistedStateKeys,
  persistedStateStorage
))

// Send everything from suber into Redux
applySuberMiddleware((_) => (channel, message, source) => {
  // No loop-backs
  if (source === 'redux') return
  // Send to Redux with the channel as the action type
  store.dispatch({...message, type: channel})
})

// Signal app upstart (for epics)
store.dispatch({ type: 'APP_START' })

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('mount')
)
