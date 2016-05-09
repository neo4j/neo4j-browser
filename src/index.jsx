import 'babel-polyfill'
import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'
import createSagaMiddleware from 'redux-saga'

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import * as reducers from './reducers'
import { App, Main, SingleFrame } from './components'
import sagas from './sagas'
import './styles/style.css'
import './styles/codemirror.css'

const sagaMiddleware = createSagaMiddleware()
const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h' changePositionKey='ctrl-q'>
    <LogMonitor theme='tomorrow' preserveScrollTop={false} />
  </DockMonitor>
)

const enhancer = compose(
  applyMiddleware(sagaMiddleware),
  DevTools.instrument()
)

const store = createStore(
  reducer,
  enhancer
)
const history = syncHistoryWithStore(browserHistory, store)
sagaMiddleware.run(sagas)

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path='/' component={App}>
          <IndexRoute component={Main}/>
          <Route path='stream/:frameId' component={SingleFrame}/>
        </Route>
      </Router>
      <DevTools />
    </div>
  </Provider>,
  document.getElementById('mount')
)
