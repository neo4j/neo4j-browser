import { Auth0Provider } from '@auth0/auth0-react'
import { auth0Config } from 'shared/config/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    window.location.href = appState?.returnTo || window.location.pathname
  }

  return (
    <Auth0Provider
      {...auth0Config}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  )
} 