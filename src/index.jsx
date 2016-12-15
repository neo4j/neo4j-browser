import 'babel-polyfill'
import createSagaMiddleware from 'redux-saga'
import 'preact/devtools'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducers from './rootReducer'
import layout from './lib/containers/origLayout'

import sagas from './sagas'
import './styles/style.css'
import './styles/codemirror.css'
import './styles/bootstrap.grid-only.min.css'
import bookmarks from './lib/containers/bookmarks'
import lStorage from './services/localstorage'
import { makeBookmarksInitialState, makeBookmarksPersistedState } from './services/localstorageMiddleware'

const sagaMiddleware = createSagaMiddleware()
const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})

const enhancer = compose(
  applyMiddleware(sagaMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)

const persistedStateKeys = ['bookmarks', 'settings', 'editor', 'favorites', 'visualization', 'datasource']
const persistedStateStorage = window.localStorage

const localStorageInitialStateMiddleware = lStorage.applyMiddleware(
  makeBookmarksInitialState(bookmarks)
)

const localStoragePersistStateMiddleware = lStorage.applyMiddleware(
  makeBookmarksPersistedState()
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
sagaMiddleware.run(sagas)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={layout.components.OrigLayout} />
    </Router>
  </Provider>,
  document.getElementById('mount')
)
