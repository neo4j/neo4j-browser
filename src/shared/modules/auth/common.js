import jwtDecode from 'jwt-decode'
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
    if (missingParamKeys !== 0) {
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

export const checkAndMergeSSOProviders = (
  discoveredSSOProviders,
  updateExistingProviders
) => {
  if (!discoveredSSOProviders || !discoveredSSOProviders.length) {
    authLog('Invalid discovered SSO providers', 'warn')
    return
  }

  const currentSSOProviders = getSSOProvidersFromStorage()

  discoveredSSOProviders.forEach(provider => {
    if (!provider) {
      authLog(`Found invalid discoved sso provider`)
      return
    }
    if (
      !mandatoryKeysForSSOProviders.every(key => provider.hasOwnProperty(key))
    ) {
      authLog(
        `dropping invalid discovered sso provider with id: "${provider.id}", missing key`
      )
      return
    }
    if (
      !mandatoryKeysForSSOProviderParams.every(key =>
        provider.params.hasOwnProperty(key)
      )
    ) {
      const missingKeys = mandatoryKeysForSSOProviderParams.filter(
        key => !provider.params.hasOwnProperty(key)
      )
      authLog(
        `Dropping invalid discovered SSO provider with id: "${
          provider.id
        }", missing params key(s) ${missingKeys.join(', ')}`
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
  let SSOProviders
  try {
    SSOProviders = JSON.parse(
      window.sessionStorage.getItem(AUTH_STORAGE_SSO_PROVIDERS)
    )
  } catch (e) {}
  if (!Array.isArray(SSOProviders)) {
    authLog('Found sso defect providers in storage, clearing..', 'warn')
    window.sessionStorage.setItem(AUTH_STORAGE_SSO_PROVIDERS, [])
    return []
  }

  if (SSOProviders.length === 0) {
    authLog('No SSO providers in (local) storage found')
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
  authLog(`Attempting to assemble credentials for idp_id: ${idpId}`)

  if (!result) {
    throw new Error('Missing result in auth result handler')
  }
  if (!idpId) {
    throw new Error('Missing idp_id in auth result handler')
  }

  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) return emptyCredentials

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
      `Could not parse JWT of type "${tokenTypePrincipal}" for idp_id "${idpId}", aborting`
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
