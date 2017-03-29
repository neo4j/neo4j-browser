import './init.js'
import { createEpicMiddleware } from 'redux-observable'
import { render } from 'preact'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'preact-redux'
import { createBus, createReduxMiddleware as createSuberReduxMiddleware } from 'suber'
import { BusProvider } from 'preact-suber'

import reducers from 'shared/rootReducer'
import epics from 'shared/rootEpic'
import App from './modules/App/App'

import { createReduxMiddleware, getAll, applyKeys } from 'services/localstorage'
import { APP_START } from 'shared/modules/app/appDuck'

// Configure localstorage sync
applyKeys('connections', 'settings', 'history', 'favorites', 'visualization')

// Create suber bus
const bus = createBus()
// Define Redux middlewares
const suberMiddleware = createSuberReduxMiddleware(bus)
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
bus.applyMiddleware((_, origin) => (channel, message, source) => {
  // No loop-backs
  if (source === 'redux') return
  // Send to Redux with the channel as the action type
  store.dispatch({...message, type: channel, ...origin})
})

// Signal app upstart (for epics)
store.dispatch({ type: APP_START })

render(
  <Provider store={store}>
    <BusProvider bus={bus}>
      <App />
    </BusProvider>
  </Provider>,
  document.getElementById('mount')
)
