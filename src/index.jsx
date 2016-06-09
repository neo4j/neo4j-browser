import 'babel-polyfill'
import createSagaMiddleware from 'redux-saga'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducers from './rootReducer'
import app from './app'
import frames from './main/frames'
import main from './main'

import sagas from './sagas'
import './styles/style.css'
import './styles/codemirror.css'
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

const persistedStateKeys = ['drawer', 'settings', 'editor', 'favorites']
const persistedStateStorage = window.localStorage

const store = createStore(
  reducer,
  getStorageForKeys(persistedStateKeys, persistedStateStorage),
  enhancer
)
store.subscribe(createPersistingStoreListener(store, persistedStateKeys, persistedStateStorage))
const history = syncHistoryWithStore(browserHistory, store)
sagaMiddleware.run(sagas)

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path='/' component={app.components.App}>
          <IndexRoute component={main.components.Main}/>
          <Route path='stream/:frameId' component={frames.components.SingleFrame}/>
        </Route>
      </Router>
    </div>
  </Provider>,
  document.getElementById('mount')
)
