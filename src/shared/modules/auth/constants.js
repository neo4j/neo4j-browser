export const SSO_REDIRECT = 'sso_redirect'
export const REDIRECT_URI = 'redirect_uri'
export const BEARER = 'bearer'
export const PKCE = 'pkce'
export const IMPLICIT = 'implicit'

export const AUTH_LOGGING_PREFIX = 'OIDC/OAuth#'

const AUTH_STORAGE_PREFIX = '/auth#'
export const AUTH_STORAGE_SSO_PROVIDERS = `${AUTH_STORAGE_PREFIX}sso_providers`
export const AUTH_STORAGE_STATE = `${AUTH_STORAGE_PREFIX}state`
export const AUTH_STORAGE_CODE_VERIFIER = `${AUTH_STORAGE_PREFIX}code_verifier`
export const AUTH_STORAGE_URL_SEARCH_PARAMS = `${AUTH_STORAGE_PREFIX}url_search_params`
export const AUTH_STORAGE_LOGS = `${AUTH_STORAGE_PREFIX}logs`
