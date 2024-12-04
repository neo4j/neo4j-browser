export type AuthenticationMethod = 'native' | 'no-auth' | 'sso'

export interface ConnectionConfig {
  host: string
  username?: string
  password?: string
  encrypted?: boolean
  authenticationMethod?: AuthenticationMethod
} 