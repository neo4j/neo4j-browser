import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { neo4jApi } from '../services/neo4jApi'
import editorReducer from '../modules/editor/editorDuck'

export const store = configureStore({
  reducer: {
    [neo4jApi.reducerPath]: neo4jApi.reducer,
    editor: editorReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(neo4jApi.middleware)
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 