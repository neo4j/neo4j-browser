import { Middleware } from '@reduxjs/toolkit'
import { secureStorage } from '../../services/secureStorage'
import { setCredentials, logout } from './authSlice'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { auth0Config } from '../../config/auth'

const AUTH_STORAGE_KEY = 'neo4j_auth'

const auth0Client = new Auth0Client(auth0Config)

export const authMiddleware: Middleware = store => next => action => {
  const result = next(action)
  
  if (setCredentials.match(action)) {
    const isSSO = action.payload.authMethod === 'sso'
    
    secureStorage.setItem(AUTH_STORAGE_KEY, {
      token: action.payload.token,
      username: action.payload.username,
      authMethod: action.payload.authMethod,
      isSSO
    })
  }
  
  if (logout.match(action)) {
    secureStorage.removeItem(AUTH_STORAGE_KEY)
  }
  
  return result
}

export const rehydrateAuth = async () => {
  const authData = secureStorage.getItem(AUTH_STORAGE_KEY)
  if (authData) {
    if (authData.isSSO) {
      try {
        const token = await auth0Client.getTokenSilently()
        return setCredentials({
          ...authData,
          token
        })
      } catch {
        return logout()
      }
    }
    return setCredentials(authData)
  }
  return logout()
} 