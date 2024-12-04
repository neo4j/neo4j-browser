import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AuthenticationMethod } from 'shared/types/auth'

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  currentUser: {
    username: string | null
    authMethod: AuthenticationMethod | null
  }
  requiresPasswordChange: boolean
  error: string | null
  loading: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  currentUser: {
    username: null,
    authMethod: null
  },
  requiresPasswordChange: false,
  error: null,
  loading: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ 
      token: string
      username: string
      authMethod: AuthenticationMethod 
    }>) => {
      state.token = action.payload.token
      state.currentUser.username = action.payload.username
      state.currentUser.authMethod = action.payload.authMethod
      state.isAuthenticated = true
    },
    setRequiresPasswordChange: (state, action: PayloadAction<boolean>) => {
      state.requiresPasswordChange = action.payload
    },
    logout: (state) => {
      state.token = null
      state.currentUser = { username: null, authMethod: null }
      state.isAuthenticated = false
      state.requiresPasswordChange = false
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { 
  setCredentials, 
  setRequiresPasswordChange, 
  logout, 
  setError 
} = authSlice.actions

export default authSlice.reducer 