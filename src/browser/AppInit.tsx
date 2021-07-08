/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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

import React from 'react'
import { createEpicMiddleware } from 'redux-observable'
import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  AnyAction,
  StoreEnhancer
} from 'redux'
import { Provider } from 'react-redux'
import {
  createBus,
  createReduxMiddleware as createSuberReduxMiddleware
} from 'suber'
import { BusProvider } from 'react-suber'
import App from './modules/App/App'
import reducers from 'shared/rootReducer'
import epics from 'shared/rootEpic'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { CaptureConsole } from '@sentry/integrations'

import { createReduxMiddleware, getAll, applyKeys } from 'services/localstorage'
import { GlobalState } from 'shared/globalState'
import { APP_START } from 'shared/modules/app/appDuck'
import { detectRuntimeEnv, isRunningE2ETest } from 'services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import { version } from 'project-root/package.json'
import { shouldAllowOutgoingConnections } from 'shared/modules/dbMeta/dbMetaDuck'
import { getUuid } from 'shared/modules/udc/udcDuck'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Configure localstorage sync
applyKeys(
  'connections',
  'settings',
  'history',
  'documents',
  'folders',
  'grass',
  'syncConsent',
  'udc',
  'experimentalFeatures'
)

// Create suber bus
const bus = createBus()
// Define Redux middlewares
const suberMiddleware = createSuberReduxMiddleware(bus)
const epicMiddleware = createEpicMiddleware(epics)
const localStorageMiddleware = createReduxMiddleware()

const reducer = combineReducers<GlobalState>({ ...(reducers as any) })

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: (
      ...args: unknown[]
    ) => StoreEnhancer<unknown>
  }
}

const enhancer: StoreEnhancer<GlobalState> = compose(
  applyMiddleware(suberMiddleware, epicMiddleware, localStorageMiddleware),
  process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__({
        actionSanitizer: (action: AnyAction) =>
          action.type === 'requests/UPDATED'
            ? {
                ...action,
                result: {
                  summary: action.result ? action.result.summary : undefined,
                  records:
                    'REQUEST RECORDS OMITTED FROM REDUX DEVTOOLS TO PREVENT OUT OF MEMORY ERROR'
                }
              }
            : action,
        stateSanitizer: (state: GlobalState) => ({
          ...state,
          requests: Object.assign(
            {},
            ...Object.entries(state.requests).map(([id, request]) => ({
              [id]: {
                ...request,
                result: {
                  ...request.result,
                  records:
                    'REQUEST RECORDS OMITTED FROM REDUX DEVTOOLS TO PREVENT OUT OF MEMORY ERROR'
                }
              }
            }))
          )
        })
      })
    : (f: unknown) => f
)

const store = createStore<GlobalState>(
  reducer,
  getAll() as GlobalState, // rehydrate from local storage on app start
  enhancer
)

// Send everything from suber into Redux
bus.applyMiddleware(
  (_, origin) => (channel: string, message: AnyAction, source: string) => {
    // No loop-backs
    if (source === 'redux') return
    // Send to Redux with the channel as the action type
    store.dispatch({ ...message, type: channel, ...origin })
  }
)

function scrubQueryParamsAndUrl(event: Sentry.Event): Sentry.Event {
  if (event.request?.query_string) {
    event.request.query_string = ''
  }
  if (event.server_name) {
    event.server_name = '/'
  }
  return event
}

export function setupSentry(): void {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn:
        'https://1ea9f7ebd51441cc95906afb2d31d841@o110884.ingest.sentry.io/1232865',
      release: `neo4j-browser@${version}`,
      integrations: [
        new Integrations.BrowserTracing(),
        new CaptureConsole({ levels: ['error'] })
      ],
      tracesSampler: context => {
        const isPerformanceTransaction = context.transactionContext.name.startsWith(
          'performance'
        )
        if (isPerformanceTransaction) {
          // 1% of performance reports is enough to build stats, raise if needed
          return 0.01
        } else {
          return 0.2
        }
      },
      beforeSend: event => {
        const allowsOutgoing = shouldAllowOutgoingConnections(store.getState())

        if (allowsOutgoing && !isRunningE2ETest) {
          return scrubQueryParamsAndUrl(event)
        } else {
          return null
        }
      },
      environment: 'unset'
    })
    Sentry.setUser({ id: getUuid(store.getState()) })

    fetch('./manifest.json')
      .then(res => res.json())
      .then(json => {
        const isCanary = Boolean(
          json && json.name.toLowerCase().includes('canary')
        )
        Sentry.configureScope(scope =>
          scope.addEventProcessor(event => ({
            ...event,
            environment: isCanary ? 'canary' : 'production'
          }))
        )
      })
      .catch(() => undefined)
  }
}

// Introduce environment to be able to fork functionality
const env = detectRuntimeEnv(window, NEO4J_CLOUD_DOMAINS)

// URL we're on
const url = window.location.href

const searchParams = new URL(url).searchParams

// Desktop/Relate params
const relateUrl = searchParams.get('relateUrl')
const relateApiToken = searchParams.get('relateApiToken')
const relateProjectId =
  searchParams.get('relateProjectId') ||
  searchParams.get('neo4jDesktopProjectId')
const neo4jDesktopGraphAppId = searchParams.get('neo4jDesktopGraphAppId')

// Signal app upstart (for epics)
store.dispatch({
  type: APP_START,
  url,
  env,
  relateUrl,
  relateApiToken,
  relateProjectId,
  neo4jDesktopGraphAppId
})

// typePolicies allow apollo cache to use these fields as 'id'
// for automated cache updates when updating a single existing entity
// https://www.apollographql.com/docs/react/caching/cache-configuration/#customizing-identifier-generation-by-type
const apolloCache = new InMemoryCache({
  typePolicies: {
    RelateFile: {
      keyFields: ['name', 'directory']
    },
    Project: {
      fields: {
        files: {
          merge: false // prefer incoming over existing data.
        }
      }
    }
  }
})

// https://www.apollographql.com/blog/file-uploads-with-apollo-server-2-0-5db2f3f60675/
const uploadLink = createUploadLink({
  uri: `${relateUrl || ''}/graphql`,
  credentials: 'same-origin',
  headers: {
    'keep-alive': 'true',
    'X-API-Token': relateApiToken,
    'X-Client-Id': neo4jDesktopGraphAppId
  }
})

const client = new ApolloClient({
  cache: apolloCache,
  link: uploadLink
})

const AppInit = (): JSX.Element => {
  return (
    <Provider store={store as any}>
      <BusProvider bus={bus}>
        <ApolloProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        </ApolloProvider>
      </BusProvider>
    </Provider>
  )
}
export default AppInit
