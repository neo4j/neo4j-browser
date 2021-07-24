import jwtDecode from 'jwt-decode'
import { isObject } from 'lodash'
import {
  AUTH_STORAGE_SSO_PROVIDERS,
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

export const getInitialisationParameters = (
  urlSearchParams = window.location.search
) => {
  const initParams = {}

  new URLSearchParams(urlSearchParams).forEach((value, key) => {
    initParams[key] = value
  })

  return initParams
}

export const checkAndMergeSSOProviders = (
  discoveredSSOProviders,
  isLocalhostOrigin
) => {
  if (!discoveredSSOProviders || !discoveredSSOProviders.length) {
    authLog('Invalid discovered SSO providers')
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
    if (!provider) return
    if (
      !mandatoryKeysForSSOProviders.every(key => provider.hasOwnProperty(key))
    ) {
      authLog(
        `Dropping invalid discovered SSO provider with id: "${provider.id}", missing key`
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
      if (isLocalhostOrigin) {
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
  const ssoProviders = JSON.parse(
    window.sessionStorage.getItem(AUTH_STORAGE_SSO_PROVIDERS)
  )
  if (!ssoProviders || !ssoProviders.length) {
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
  return ssoProviders
}

export const getSSOProviderByIdpId = idpId => {
  const ssoProviders = getSSOProvidersFromStorage()

  const selectedSSOProvider = ssoProviders.find(
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

  const tokenTypeAuthentication =
    selectedSSOProvider.config?.['token_type_authentication'] ||
    defaultTokenTypeAuthentication
  authLog(
    `Credentials assembly with token type "${tokenTypeAuthentication}" as password`
  )

  return { username: credsPrincipal, password: result[tokenTypeAuthentication] }
}

export const temporarlyStoreUrlSearchParams = () => {
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

export const shouldRedirectToSSOServer = () => {
  const { cmd, arg } = getInitialisationParameters()
  return (cmd || '').toLowerCase() === SSO_REDIRECT && arg
}

export const wasRedirectedBackFromSSOServer = () => {
  const { auth_flow_step: authFlowStep } = getInitialisationParameters()
  return (authFlowStep || '').toLowerCase() === REDIRECT_URI
}

export const restoreSearchParams = () => {
  authLog(`Retrieving temporarly stored url search params`)
  try {
    const storedParams = JSON.parse(
      window.sessionStorage.getItem(AUTH_STORAGE_URL_SEARCH_PARAMS)
    )

    window.sessionStorage.setItem(AUTH_STORAGE_URL_SEARCH_PARAMS, '')

    if (isObject(storedParams)) {
      addSearchParamsInBrowserHistory(storedParams)
      return storedParams
    } else {
      authLog('Invalid temporarly stored url search params')
      return null
    }
  } catch (err) {
    authLog(
      `Error when parsing temporarly stored url search params, err: ${err}`
    )
    return null
  }
}
