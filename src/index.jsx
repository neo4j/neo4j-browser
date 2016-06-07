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
import favorites from './sidebar/favorites'

import sagas from './sagas'
import './styles/style.css'
import './styles/codemirror.css'

const sagaMiddleware = createSagaMiddleware()
const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})

const enhancer = compose(
  applyMiddleware(sagaMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)

const store = createStore(
  reducer,
  enhancer
)

let currentValue
function favoritesChange () {
  let previousValue = currentValue
  currentValue = store.getState().favorites
  if (previousValue !== currentValue) {
    store.dispatch({
      type: favorites.actionTypes.FAVORITES_UPDATED,
      scripts: currentValue
    })
  }
}

store.subscribe(favoritesChange)
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
