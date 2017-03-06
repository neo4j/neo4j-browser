import 'babel-polyfill'
import { createEpicMiddleware } from 'redux-observable'
import 'preact/devtools'
import { render } from 'preact'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { applyMiddleware as applySuberMiddleware, createReduxMiddleware as createSuberReduxMiddleware } from 'suber'

import reducers from 'shared/rootReducer'
import App from './modules/App/App'

import epics from 'shared/rootEpic'
import './styles/style.css'
import './styles/codemirror.css'
import './styles/bootstrap.grid-only.min.css'
import { createReduxMiddleware, getAll, applyKeys } from 'services/localstorage'

// Configure localstorage sync
applyKeys('connections', 'settings', 'history', 'favorites')

// Define Redux middlewares
const suberMiddleware = createSuberReduxMiddleware()
const epicMiddleware = createEpicMiddleware(epics)
const localStorageMiddleware = createReduxMiddleware()

const reducer = combineReducers({ ...reducers })

const enhancer = compose(
  applyMiddleware(suberMiddleware, epicMiddleware, localStorageMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)

const store = createStore(
  reducer,
  getAll(), // rehydrate from local storage on app start
  enhancer
)

// Send everything from suber into Redux
applySuberMiddleware((_) => (channel, message, source) => {
  // No loop-backs
  if (source === 'redux') return
  // Send to Redux with the channel as the action type
  store.dispatch({...message, type: channel})
})

// Signal app upstart (for epics)
store.dispatch({ type: 'APP_START' })

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('mount')
)
