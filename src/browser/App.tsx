import { Auth0Provider } from '@auth0/auth0-react'
import { auth0Config } from 'shared/config/auth'

export function App() {
  return (
    <Auth0Provider {...auth0Config}>
      {/* existing app content */}
    </Auth0Provider>
  )
} 