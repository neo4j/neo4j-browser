import jwtDecode from 'jwt-decode'
import { isObject } from 'lodash-es'
import {
  AUTH_STORAGE_URL_SEARCH_PARAMS,
  REDIRECT_URI,
  SSO_REDIRECT
} from './constants'
import { addSearchParamsInBrowserHistory, authLog, authDebug } from './helpers'
import {
  defaultTokenTypeAuthentication,
  defaultTokenTypePrincipal,
  mandatoryKeysForSSOProviderParams,
  mandatoryKeysForSSOProviders
} from './settings'

export const getInitialisationParameters = () => {
  const urlSearchParams = window.location.search
  const urlHashParamsAsSearchParams = '?' + window.location.hash.substring(1)

  const initParams = {}
  new URLSearchParams(urlSearchParams).forEach((value, key) => {
    initParams[key] = value
  })
  new URLSearchParams(urlHashParamsAsSearchParams).forEach((value, key) => {
    initParams[key] = value
  })

  return initParams
}

export const getValidSSOProviders = discoveredSSOProviders => {
  if (!discoveredSSOProviders) {
    return []
  }

  if (!Array.isArray(discoveredSSOProviders)) {
    authLog(
      `Discovered SSO providers should be a list, got ${discoveredSSOProviders}`,
      'warn'
    )
  }

  if (discoveredSSOProviders.length === 0) {
    authLog('List of discovered SSO providers was empty', 'warn')
    return []
  }

  const validSSOProviders = discoveredSSOProviders.filter(provider => {
    const missingKeys = mandatoryKeysForSSOProviders.filter(
      key => !provider.hasOwnProperty(key)
    )
    if (missingKeys.length !== 0) {
      authLog(
        `dropping invalid discovered sso provider with id: "${
          provider.id
        }", missing key(s) ${missingKeys.join(', ')} `
      )
      return false
    }

    const missingParamKeys = mandatoryKeysForSSOProviderParams.filter(
      key => !provider.params.hasOwnProperty(key)
    )
    if (missingParamKeys.length !== 0) {
      authLog(
        `Dropping invalid discovered SSO provider with id: "${
          provider.id
        }", missing params key(s) ${missingKeys.join(', ')}`
      )
      return false
    }

    return true
  })

  authLog('Checked SSO providers')
  return validSSOProviders
}

export const getCredentialsFromAuthResult = (result, selectedSSOProvider) => {
  authLog(
    `Attempting to assemble credentials for idp_id: ${selectedSSOProvider.id}`
  )
  if (!selectedSSOProvider) {
    throw new Error('No SSO provider passed')
  }

  if (!result) {
    throw new Error('Missing result in auth result handler')
  }

  const tokenTypePrincipal =
    selectedSSOProvider.config?.['token_type_principal'] ||
    defaultTokenTypePrincipal

  authLog(
    `Credentials, using token type "${tokenTypePrincipal}" to retrieve principal`
  )

  let parsedJWT
  try {
    parsedJWT = jwtDecode(result[tokenTypePrincipal])
  } catch (e) {}

  if (!parsedJWT) {
    throw new Error(
      `Could not parse JWT of type "${tokenTypePrincipal}" for idp_id "${selectedSSOProvider.id}", aborting`
    )
  }
  authDebug('Credentials, parsed JWT', parsedJWT)

  const principal = selectedSSOProvider.config?.principal
  if (principal) {
    authLog(`Credentials, provided principal in config: ${principal}`)
  } else {
    authLog(
      `Credentials, no principal provided in config, falling back to 'username' then 'sub'`
    )
  }

  const credsPrincipal =
    parsedJWT[principal] || parsedJWT.email || parsedJWT.sub
  authLog(`Credentials assembly with username: ${credsPrincipal}`)

  const configuredTokenType =
    selectedSSOProvider.config?.['token_type_authentication']
  const tokenTypeAuthentication =
    configuredTokenType || defaultTokenTypeAuthentication

  if (!configuredTokenType) {
    authLog(
      `token_type_authentication not configured, using default token type "${defaultTokenTypeAuthentication}".`
    )
  }

  authLog(
    `Credentials assembled with token type "${tokenTypeAuthentication}" as password. If connection still does not succeed, make sure neo4j.conf is set up correctly`
  )

  return { username: credsPrincipal, password: result[tokenTypeAuthentication] }
}

export const temporarilyStoreUrlSearchParams = () => {
  const currentBrowserURLParams = getInitialisationParameters()
  authLog(
    `Temporarily storing the url search params. data: "${JSON.stringify(
      currentBrowserURLParams
    )}"`
  )
  window.sessionStorage.setItem(
    AUTH_STORAGE_URL_SEARCH_PARAMS,
    JSON.stringify(currentBrowserURLParams)
  )
}

export const getSSOServerIdIfShouldRedirect = () => {
  const { searchParams } = new URL(window.location.href)
  return searchParams.get(SSO_REDIRECT)
}

export const wasRedirectedBackFromSSOServer = () => {
  const { auth_flow_step: authFlowStep } = getInitialisationParameters()
  return (authFlowStep || '').toLowerCase() === REDIRECT_URI
}

export const restoreSearchAndHashParams = () => {
  authLog(`Retrieving temporarily stored url search params`)
  try {
    const storedParams = JSON.parse(
      window.sessionStorage.getItem(AUTH_STORAGE_URL_SEARCH_PARAMS)
    )

    window.sessionStorage.setItem(AUTH_STORAGE_URL_SEARCH_PARAMS, '')

    if (!isObject(storedParams)) {
      throw new Error(
        `Stored search params were ${storedParams}, expected an object`
      )
    }
    const crntHashParams = window.location.hash || undefined
    addSearchParamsInBrowserHistory(storedParams)
    const newUrl = `${window.location.href}${crntHashParams || ''}`
    window.history.replaceState({}, '', newUrl)
    return storedParams
  } catch (err) {
    authLog(
      `Error when parsing temporarily stored url search params, err: ${err}. Clearing.`
    )
    window.sessionStorage.setItem(AUTH_STORAGE_URL_SEARCH_PARAMS, '')
    return null
  }
}
