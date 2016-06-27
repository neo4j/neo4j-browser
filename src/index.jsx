import 'babel-polyfill'
import createSagaMiddleware from 'redux-saga'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducers from './rootReducer'
import BaseLayout from './lib/components/BaseLayout'

import sagas from './sagas'
import './styles/style.css'
import './styles/codemirror.css'
import bookmarks from './lib/containers/bookmarks'
import { getStorageForKeys, createPersistingStoreListener } from './services/localstorage'

const sagaMiddleware = createSagaMiddleware()
const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})

const enhancer = compose(
  applyMiddleware(sagaMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)

const persistedStateKeys = ['bookmarks', 'settings', 'editor', 'favorites']
const persistedStateStorage = window.localStorage
const initalStateManipulation = (key, val) => {
  if (key !== 'bookmarks') return val
  if (!val) {
    val = bookmarks.reducer(undefined, '')
  }
  const out = {}
  out.allBookmarkIds = [].concat(val.allBookmarkIds)
  out.bookmarksById = Object.assign({}, val.bookmarksById)
  out.activeBookmark = 'offline' // Always start in offline mode

  // If offline exists, return
  if (val.allBookmarkIds.indexOf('offline') > -1) return out

  // If not, add it
  out.allBookmarkIds = ['offline'].concat(out.allBookmarkIds)
  out.bookmarksById = Object.assign(out.bookmarksById, {'offline': {name: 'Offline', type: 'offline', id: 'offline'}})
  return out
}

const store = createStore(
  reducer,
  getStorageForKeys(persistedStateKeys, persistedStateStorage, initalStateManipulation),
  enhancer
)
store.subscribe(createPersistingStoreListener(store, persistedStateKeys, persistedStateStorage))
const history = syncHistoryWithStore(browserHistory, store)
sagaMiddleware.run(sagas)

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path='/' component={BaseLayout} />
      </Router>
    </div>
  </Provider>,
  document.getElementById('mount')
)
