import jwtDecode from 'jwt-decode'
import { isObject } from 'lodash'
import {
  AUTH_STORAGE_SSO_PROVIDERS,
  AUTH_STORAGE_URL_SEARCH_PARAMS,
  REDIRECT_URI
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

export const checkAndMergeSSOProviders = (
  discoveredSSOProviders,
  updateExistingProviders
) => {
  if (!discoveredSSOProviders || !discoveredSSOProviders.length) {
    authLog('Invalid discovered SSO providers', 'warn')
    return
  }

  let currentSSOProviders =
    JSON.parse(window.sessionStorage.getItem(AUTH_STORAGE_SSO_PROVIDERS)) || []
  if (!Array.isArray(currentSSOProviders)) {
    authLog(
      'Found SSO providers in storage are defect, consider clearing the SSO provider state and reload',
      'warn'
    )
    currentSSOProviders = []
  }

  discoveredSSOProviders.forEach(provider => {
    if (!provider) {
      authlog(`Found invalid discoved sso provider`)
      return
    }
    if (
      !mandatoryKeysForSSOProviders.every(key => provider.hasOwnProperty(key))
    ) {
      authlog(
        `dropping invalid discovered sso provider with id: "${provider.id}", missing key`
      )
      return
    }
    if (
      !mandatoryKeysForSSOProviderParams.every(key =>
        provider?.params?.hasOwnProperty(key)
      )
    ) {
      authLog(
        `Dropping invalid discovered SSO provider with id: "${provider.id}", missing params key`
      )
      return
    }
    if (
      currentSSOProviders.find(crntProvider => crntProvider.id === provider.id)
    ) {
      if (updateExistingProviders) {
        const idx = currentSSOProviders.findIndex(
          crntProvider => crntProvider.id === provider.id
        )
        currentSSOProviders.splice(idx, 1)
        authLog(`Updating SSO provider with id: "${provider.id}"`)
      } else {
        authLog(
          `Not accepting discovered SSO provider with id: "${provider.id}", id exists already`
        )
        return
      }
    }
    currentSSOProviders.push(provider)
  })

  window.sessionStorage.setItem(
    AUTH_STORAGE_SSO_PROVIDERS,
    JSON.stringify(currentSSOProviders)
  )
  authLog('Checked and merged SSO providers')
}

export const getSSOProvidersFromStorage = () => {
  const SSOProviders = JSON.parse(
    window.sessionStorage.getItem(AUTH_STORAGE_SSO_PROVIDERS)
  )
  if (!SSOProviders || !SSOProviders.length) {
    authLog('No SSO providers in (local) storage found')
    return []
  }
  if (!window.isSecureContext) {
    authLog(
      'This application is NOT executed in a secure context. SSO support is therefore disabled. Load the application in a secure context to proceed with SSO.',
      'warn'
    )
    return []
  }
  return SSOProviders
}

export const getSSOProviderByIdpId = idpId => {
  const SSOProviders = getSSOProvidersFromStorage()

  const selectedSSOProvider = SSOProviders.find(
    provider => provider.id === idpId
  )
  if (!selectedSSOProvider) {
    authLog(`No matching SSO provider to passed in argument: ${idpId}`, 'warn')
    return null
  }
  return selectedSSOProvider
}

export const getCredentialsFromAuthResult = (result, idpId) => {
  const emptyCredentials = { username: '', password: '' }
  authLog(`Attempting to assemble credentials for idp_id: ${idpId}`)

  if (!result || !idpId) {
    authLog('No result or idp_id passed in', 'warn')
    return emptyCredentials
  }

  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) return emptyCredentials

  const tokenTypePrincipal =
    selectedSSOProvider.config?.['token_type_principal'] ||
    defaultTokenTypePrincipal
  authLog(
    `Credentials, using token type "${tokenTypePrincipal}" to retrieve principal`
  )

  const parsedJWT = jwtDecode(result[tokenTypePrincipal])
  authDebug('Credentials, parsed JWT', parsedJWT)

  if (!parsedJWT) {
    authLog(
      `Could not parse JWT of type "${tokenTypePrincipal}" for idp_id "${idpId}", aborting`,
      'warn'
    )
    return emptyCredentials
  }

  const principal = selectedSSOProvider.config?.principal || ''
  authLog(`Credentials, provided principal in config: ${principal}`)

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
    `Temporarly storing the url search params. data: "${JSON.stringify(
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

    if (isObject(storedParams)) {
      const crntHashParams = window.location.hash || undefined
      addSearchParamsInBrowserHistory(storedParams)
      const newUrl = `${window.location.href}${crntHashParams || ''}`
      window.history.replaceState({}, '', newUrl)
      return storedParams
    } else {
      authLog('Invalid temporarily stored url search params')
      return null
    }
  } catch (err) {
    authLog(
      `Error when parsing temporarily stored url search params, err: ${err}`
    )
    return null
  }
}
