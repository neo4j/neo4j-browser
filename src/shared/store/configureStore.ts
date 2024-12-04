import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { neo4jApi } from '../services/neo4jApi'
import { authApi } from '../services/authApi'
import rootReducer from '../rootReducer'
import { createReduxMiddleware as createLocalStorageMiddleware } from '../services/localstorage'
import { authMiddleware, rehydrateAuth } from '../modules/auth/authMiddleware'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(neo4jApi.middleware)
      .concat(authApi.middleware)
      .concat(createLocalStorageMiddleware())
      .concat(authMiddleware)
})

setupListeners(store.dispatch)

// Rehydrate auth state
store.dispatch(rehydrateAuth())

export type AppDispatch = typeof store.dispatch 