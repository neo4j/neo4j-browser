import {
  getCredentialsFromAuthResult,
  getInitialisationParameters,
  getSSOProviderByIdpId,
  temporarlyStoreUrlSearchParams
} from './common'
import {
  AUTH_STORAGE_CODE_VERIFIER,
  AUTH_STORAGE_STATE,
  BEARER,
  IMPLICIT,
  PKCE
} from './constants'
import {
  createStateForRequest,
  createNonce,
  createCodeVerifier,
  createCodeChallenge,
  authLog,
  authDebug,
  removeSearchParamsInBrowserHistory
} from './helpers'
import {
  defaultCodeChallengeMethod,
  defaultGrantType,
  searchParamsToRemoveAfterAuthRedirect
} from './settings'

export const authRequestForSSO = idpId => {
  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) {
    const error = `Invalid OAuth2 endpoint: "${oauth2Endpoint}"`
    authLog(error)
    return error
  }

  temporarlyStoreUrlSearchParams()

  const oauth2Endpoint = selectedSSOProvider.auth_endpoint
  if (!oauth2Endpoint) {
    const error = `Invalid OAuth2 endpoint: "${oauth2Endpoint}"`
    authLog(error)
    return error
  }
  authLog(`Using OAuth2 endpoint: "${oauth2Endpoint}" for idp_id: ${idpId}`)

  const form = document.createElement('form')
  form.setAttribute('method', 'GET')
  form.setAttribute('action', oauth2Endpoint)

  const ssoParams = selectedSSOProvider.params || {}
  const state = createStateForRequest()
  let params = {
    ...ssoParams,
    state
  }
  window.sessionStorage.setItem(AUTH_STORAGE_STATE, state)

  const ssoExtraAuthParams = selectedSSOProvider.auth_params || {}
  if (ssoExtraAuthParams) {
    params = {
      ...params,
      ...ssoExtraAuthParams
    }
  }

  authLog(
    `Using the following authorization parameter: ${JSON.stringify(ssoParams)}`
  )

  const ssoConfig = selectedSSOProvider.config || {}
  if (ssoConfig.implicit_flow_requires_nonce) {
    params = {
      ...params,
      nonce: createNonce()
    }
    authLog(`Using nonce in authorization request`)
  }

  const _submitForm = (form, params) => {
    for (const param in params) {
      const input = document.createElement('input')
      input.setAttribute('type', 'hidden')
      input.setAttribute('name', param)
      input.setAttribute('value', params[param])
      form.appendChild(input)
    }

    document.body.appendChild(form)
    form.submit()
  }

  if (selectedSSOProvider.auth_flow === PKCE) {
    const codeChallengeMethod =
      ssoConfig.code_challenge_method || defaultCodeChallengeMethod
    authLog(
      `Auth flow "PKCE", using code_challenge_method: "${codeChallengeMethod}"`
    )

    const codeVerifier = createCodeVerifier(codeChallengeMethod)
    window.sessionStorage.setItem(AUTH_STORAGE_CODE_VERIFIER, codeVerifier)

    createCodeChallenge(codeChallengeMethod, codeVerifier).then(
      codeChallenge => {
        params = {
          ...params,
          code_challenge_method: codeChallengeMethod,
          code_challenge: codeChallenge
        }
        _submitForm(form, params)
      }
    )
  } else if (selectedSSOProvider.auth_flow === IMPLICIT) {
    authLog('Auth flow "implicit flow"')
    _submitForm(form, params)
  } else {
    const error = `Auth flow "${selectedSSOProvider.auth_flow}" is not supported.`
    authLog(error)
    return error
  }
}

export const handleAuthFromRedirect = () =>
  new Promise((resolve, reject) => {
    const {
      idp_id: idpId,
      token_type: tokenType,
      access_token: accessToken,
      id_token: idToken,
      error_description: errorDescription,
      code,
      state,
      error
    } = getInitialisationParameters()

    removeSearchParamsInBrowserHistory(searchParamsToRemoveAfterAuthRedirect)

    if (error) {
      const errorMsg = `Error detected after auth redirect, aborting. Error: ${error}, Error description: ${errorDescription}`
      authLog(errorMsg, 'warn')
      reject(errorMsg)
      return
    }

    if (!idpId) {
      const errorIdpMsg = 'Invalid idp_id parameter, aborting'
      authLog(errorIdpMsg, 'warn')
      reject(errorIdpMsg)
      return
    }

    const savedState = window.sessionStorage.getItem(AUTH_STORAGE_STATE)
    if (state !== savedState) {
      const errorStateMsg = 'Invalid state parameter, aborting'
      authLog(errorStateMsg, 'warn')
      reject(errorStateMsg)
      return
    }
    window.sessionStorage.setItem(AUTH_STORAGE_STATE, '')

    if ((tokenType || '').toLowerCase() === BEARER && accessToken) {
      authLog('Successfully aquired access_token in "implicit flow"')

      authDebug('Implicit flow id_token', idToken)
      authDebug('Implicit flow access_token', accessToken)

      const credentials = getCredentialsFromAuthResult(
        { access_token: accessToken, id_token: idToken },
        idpId
      )
      resolve(credentials)
    } else {
      authLog('Attempting to fetch token information in "PKCE flow"')

      authRequestForToken(idpId, code)
        .then(data => {
          data.json().then(result => {
            if (result && result.error) {
              const errorType = result?.error || 'unknown'
              const errorDesc = result['error_description'] || 'unknown'
              const errorMsg = `Error detected after auth token request, aborting. Error: ${errorType}, Error description: ${errorDesc}`
              authLog(errorMsg, 'warn')
              reject(errorMsg)
            } else {
              authLog('Successfully aquired token results')
              authDebug('PKCE flow result', result)

              const credentials = getCredentialsFromAuthResult(result, idpId)
              resolve(credentials)
            }
          })
        })
        .catch(err => {
          const errRequestMsg = `Aquiring token results for PKCE auth flow failed, err: ${err}`
          authLog(errRequestMsg, 'warn')
          reject(errRequestMsg)
        })
    }
  })

export const authRequestForToken = (idpId, code) => {
  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) return

  const ssoParams = selectedSSOProvider.params || {}
  let details = {
    grant_type: defaultGrantType,
    client_id: ssoParams.client_id,
    redirect_uri: ssoParams.redirect_uri,
    code_verifier: window.sessionStorage.getItem(AUTH_STORAGE_CODE_VERIFIER),
    code
  }
  window.sessionStorage.setItem(AUTH_STORAGE_CODE_VERIFIER, '')

  const ssoExtraTokenParams = selectedSSOProvider.token_params || {}
  if (ssoExtraTokenParams) {
    details = {
      ...details,
      ...ssoExtraTokenParams
    }
  }

  const requestOptions = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  let requestBody = []
  for (const property in details) {
    const encodedKey = encodeURIComponent(property)
    const encodedValue = encodeURIComponent(details[property])
    requestBody.push(encodedKey + '=' + encodedValue)
  }
  requestBody = requestBody.join('&')

  authLog(`Request for token in PKCE flow, idp_id: ${idpId}`)
  const requestUrl = `${selectedSSOProvider.token_endpoint}?`
  return window.fetch(requestUrl, { ...requestOptions, body: requestBody })
}
