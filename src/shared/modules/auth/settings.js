export const mandatoryKeysForSSOProviders = [
  'id',
  'name',
  'auth_flow',
  'params',
  'auth_endpoint',
  'well_known_discovery_uri'
]
export const mandatoryKeysForSSOProviderParams = [
  'client_id',
  'redirect_uri',
  'response_type',
  'scope'
]

export const searchParamsToRemoveAfterAutoRedirect = ['cmd', 'arg']
export const searchParamsToRemoveAfterAuthRedirect = [
  'idp_id',
  'auth_flow_step',
  'state',
  'session_state',
  'code'
]

export const defaultTokenTypePrincipal = 'access_token'
export const defaultTokenTypeAuthentication = 'access_token'
export const defaultGrantType = 'authorization_code'
export const defaultCodeChallengeMethod = 'S256'

export const isAuthLoggingEnabled = true
export const isAuthDebuggingEnabled = process.env.NODE_ENV !== 'production'
