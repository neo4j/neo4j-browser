import {
  getCredentialsFromAuthResult,
  getInitialisationParameters,
  getSSOProviderByIdpId,
  temporarilyStoreUrlSearchParams
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
  if (!window.isSecureContext) {
    throw new Error(
      'This application is NOT executed in a secure context. SSO support is therefore disabled. Load the application in a secure context to proceed with SSO.'
    )
  }
  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) {
    throw new Error(`Could not find any SSO provider with idpId: "${idpId}"`)
  }

  temporarilyStoreUrlSearchParams()

  const oauth2Endpoint = selectedSSOProvider.auth_endpoint
  if (!oauth2Endpoint) {
    throw new Error(`Invalid OAuth2 endpoint: "${oauth2Endpoint}"`)
  }
  authLog(`Using OAuth2 endpoint: "${oauth2Endpoint}" for idp_id: ${idpId}`)

  const form = document.createElement('form')
  form.setAttribute('method', 'GET')
  form.setAttribute('action', oauth2Endpoint)

  const SSOParams = selectedSSOProvider.params || {}
  const state = createStateForRequest()
  let params = {
    ...SSOParams,
    state
  }
  window.sessionStorage.setItem(AUTH_STORAGE_STATE, state)

  const SSOExtraAuthParams = selectedSSOProvider.auth_params || {}
  if (SSOExtraAuthParams) {
    params = {
      ...params,
      ...SSOExtraAuthParams
    }
  }

  authLog(
    `Using the following authorization parameter: ${JSON.stringify(SSOParams)}`
  )

  const SSOConfig = selectedSSOProvider.config || {}
  if (SSOConfig.implicit_flow_requires_nonce) {
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
      SSOConfig.code_challenge_method || defaultCodeChallengeMethod
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
    throw new Error(
      `Auth flow "${selectedSSOProvider.auth_flow}" is not supported.`
    )
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
      reject(
        new Error(
          `Error detected after auth redirect, aborting. Error: ${error}, Error description: ${errorDescription}`
        )
      )
      return
    }

    if (!idpId) {
      reject(new Error('Invalid idp_id parameter, aborting'))
      return
    }

    const savedState = window.sessionStorage.getItem(AUTH_STORAGE_STATE)
    if (state !== savedState) {
      reject(new Error('Invalid state parameter, aborting'))
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
      if (credentials.password && credentials.username) {
        resolve(credentials)
      } else {
        reject(new Error("Couldn't get credientals from accesstoken"))
      }
    } else {
      authLog('Attempting to fetch token information in "PKCE flow"')

      authRequestForToken(idpId, code)
        .then(data => {
          data.json().then(result => {
            if (result && result.error) {
              const errorType = result?.error || 'unknown'
              const errorDesc = result['error_description'] || 'unknown'
              const errorMsg = `Error detected after auth token request, aborting. Error: ${errorType}, Error description: ${errorDesc}`
              reject(new Error(errorMsg))
            } else {
              authLog('Successfully aquired token results')
              authDebug('PKCE flow result', result)

              const credentials = getCredentialsFromAuthResult(result, idpId)
              if (credentials.password && credentials.username) {
                resolve(credentials)
              } else {
                reject(new Error("Couldn't get credientals from accesstoken"))
              }
            }
          })
        })
        .catch(err => {
          reject(
            new Error(
              `Aquiring token results for PKCE auth flow failed, err: ${err}`
            )
          )
        })
    }
  })

export const authRequestForToken = (idpId, code) => {
  const selectedSSOProvider = getSSOProviderByIdpId(idpId)
  if (!selectedSSOProvider) {
    throw new Error(`Missing SSO Provider for idpId: ${idpId}`)
  }

  const SSOParams = selectedSSOProvider.params || {}
  let details = {
    grant_type: defaultGrantType,
    client_id: SSOParams.client_id,
    redirect_uri: SSOParams.redirect_uri,
    code_verifier: window.sessionStorage.getItem(AUTH_STORAGE_CODE_VERIFIER),
    code
  }
  window.sessionStorage.setItem(AUTH_STORAGE_CODE_VERIFIER, '')

  const SSOExtraTokenParams = selectedSSOProvider.token_params || {}
  if (SSOExtraTokenParams) {
    details = {
      ...details,
      ...SSOExtraTokenParams
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
