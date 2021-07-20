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
export const searchParamsToSaveForAfterAuthRedirect = [
  'connectURL',
  'discoveryURL',
  'search',
  'perspective',
  'run'
]

export const isAuthLoggingEnabled = true // TODO: create a setting? or just check the NODE_ENV? always log warn and error?
export const isAuthDebuggingEnabled = true // TODO: check the NODE_ENV, shall only work in development
