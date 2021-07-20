import jwtDecode from 'jwt-decode'
import { isObject } from 'lodash'
import {
  AUTH_STORAGE_SSO_PROVIDERS,
  AUTH_STORAGE_URL_SEARCH_PARAMS,
  SSO_REDIRECT,
  REDIRECT_URI
} from './constants'
import { addSearchParamsInBrowserHistory, authLog } from './helpers'
import {
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
  const _parseJWTAndSetCredentials = toParseToken => {
    const parsedJWT = jwtDecode(toParseToken)

    // TODO: remove this
    console.log('Parsed JWT: ', parsedJWT)

    if (!parsedJWT) {
      authLog(`Could not parse JWT for idp_id: ${idpId}, aborting`, 'warn')
      return { username: '', password: '' }
    }

    const email = parsedJWT[principal] || parsedJWT.email || parsedJWT.sub
    authLog(`Credentials assembly, username: ${email}`)

    return { username: email, password: result.access_token }
  }

  let credentials = {}
  authLog(`Attempting to assemble credentials for idp_id: ${idpId}`)

  if (!result || !idpId) {
    authLog('No result or idp_id passed in', 'warn')
    return credentials
  }

  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) return

  const principal = selectedSSOProvider.config?.principal || ''
  authLog(`Credentials, principal: ${principal}`)

  switch (idpId) {
    case 'google-oidc':
      if (!result.id_token) {
        authLog('No id_token in google-oidc result!', 'warn')
        authLog(
          `We do not support auth_flow: "${selectedSSOProvider.auth_flow}" for idp_id: "${idpId}" at the moment`,
          'warn'
        )
        // INFO: Another HTTP call would be needed to get an id_token.
        credentials = { username: '', password: '' }
        break
      }
      credentials = _parseJWTAndSetCredentials(result.id_token)
      break
    default:
      credentials = _parseJWTAndSetCredentials(result.access_token)
      break
  }
  return credentials
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

export const shouldRedirectToSSOServer = (
  searchParams = new URL(window.location.href).searchParams
) => {
  const cmd = (searchParams.get('cmd') || '').toLowerCase()
  const arg = searchParams.get('arg')

  return cmd === SSO_REDIRECT && arg
}

export const wasRedirectedBackFromSSOServer = (
  searchParams = new URL(window.location.href).searchParams
) => {
  const authFlowStep = (searchParams.get('auth_flow_step') || '').toLowerCase()

  return authFlowStep === REDIRECT_URI
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
