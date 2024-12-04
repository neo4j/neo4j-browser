import { useAuth0 } from '@auth0/auth0-react'
import { useSelector, useDispatch } from 'react-redux'
import { useConnectMutation } from '../services/authApi'
import { setCredentials, logout, setError } from '../modules/auth/authSlice'
import type { AuthenticationMethod } from '../types/auth'
import type { RootState } from '../rootReducer'

export const useAuth = () => {
  const dispatch = useDispatch()
  const [connect] = useConnectMutation()
  const auth = useSelector((state: RootState) => state.auth)
  const { 
    loginWithRedirect, 
    logout: auth0Logout,
    getAccessTokenSilently,
    user: auth0User,
    isAuthenticated: isAuth0Authenticated
  } = useAuth0()

  const login = async (credentials: {
    username: string
    password: string
    host: string
    authenticationMethod: AuthenticationMethod
  }) => {
    try {
      if (credentials.authenticationMethod === 'sso') {
        await loginWithRedirect({
          appState: { returnTo: window.location.pathname }
        })
        return
      }

      const result = await connect(credentials).unwrap()
      if (result.success) {
        dispatch(setCredentials({
          token: result.token!,
          username: credentials.username,
          authMethod: credentials.authenticationMethod
        }))
      } else {
        dispatch(setError(result.error || 'Login failed'))
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const signOut = async () => {
    if (auth.currentUser?.authMethod === 'sso') {
      await auth0Logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      })
    }
    dispatch(logout())
  }

  return {
    isAuthenticated: auth.isAuthenticated || isAuth0Authenticated,
    user: auth.currentUser || auth0User,
    error: auth.error,
    login,
    signOut
  }
} 