/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { debounce } from 'lodash-es'
import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'

import ChangePasswordForm from './ChangePasswordForm'
import ConnectForm from './ConnectForm'
import ConnectedView from './ConnectedView'
import { StyledConnectionBody } from './styled'
import { getAllowedBoltSchemes } from 'shared/modules/app/appDuck'
import { CLOUD_SCHEMES } from 'shared/modules/app/appDuck'
import type { AuthenticationMethod } from 'shared/types/auth'
import { useAuth } from 'shared/hooks/useAuth'
import { switchConnection } from 'shared/modules/connections/connectionsDuck'
import { 
  generateBoltUrl,
  getScheme,
  isNonSupportedRoutingSchemeError,
  toggleSchemeRouting,
  boltToHttp
} from 'services/boltscheme.utils'
import { isCloudHost as isAuraHost } from 'shared/services/utils'
import { NEO4J_CLOUD_DOMAINS } from 'shared/modules/settings/settingsDuck'
import { fetchBrowserDiscoveryDataFromUrl } from 'shared/modules/discovery/discoveryHelpers'
import { Neo4jError } from 'neo4j-driver'

interface ConnectionFormProps {
  frame?: any
  onSuccess?: () => void
  error: (error: Error | Record<string, never>) => void
  isConnected?: boolean
  showExistingPasswordInput?: boolean
}

interface ConnectionFormState {
  requestedUseDb: string
  host: string
  authenticationMethod: AuthenticationMethod
  username: string
  password: string
  isLoading: boolean
  connecting: boolean
  passwordChangeNeeded: boolean
  used: boolean
  SSOProviders?: any[]
  SSOError?: string
  SSOLoading?: boolean
  hostInputVal?: string
}

const getAllowedSchemesForHost = (host: string, allowedSchemes: string[]) =>
  isAuraHost(host, NEO4J_CLOUD_DOMAINS) ? CLOUD_SCHEMES : allowedSchemes

// Add fetchHostDiscovery function
const fetchHostDiscovery = debounce(async (host: string, setState: React.Dispatch<React.SetStateAction<ConnectionFormState>>) => {
  const discoveryUrl = boltToHttp(host)
  setState(prev => ({ ...prev, SSOLoading: true }))
  
  try {
    const result = await fetchBrowserDiscoveryDataFromUrl(discoveryUrl)
    if (result.success) {
      setState(prev => ({
        ...prev,
        SSOProviders: result.SSOProviders,
        SSOError: undefined,
        SSOLoading: false
      }))
    } else {
      const message = `Failed to load SSO providers ${result.message}`
      console.error(message)
      setState(prev => ({
        ...prev,
        SSOError: message,
        SSOLoading: false
      }))
    }
  } catch (err) {
    setState(prev => ({
      ...prev,
      SSOError: err instanceof Error ? err.message : 'Unknown error',
      SSOLoading: false
    }))
  }
}, 200)

export function ConnectionFormController({ 
  frame,
  onSuccess = () => undefined,
  error,
  isConnected = false,
  showExistingPasswordInput = true
}: ConnectionFormProps) {
  const { login } = useAuth()
  const allowedSchemes = useSelector(getAllowedBoltSchemes)
  const dispatch = useDispatch()

  const [state, setState] = useState<ConnectionFormState>(() => {
    const connection = {} // Initial empty state
    return {
      requestedUseDb: '',
      ...connection,
      host: '',
      authenticationMethod: 'native',
      username: '',
      password: '',
      isLoading: false,
      connecting: false,
      passwordChangeNeeded: false,
      used: false
    }
  })

  // Form handlers
  const onHostChange = useCallback((host: string) => {
    const schemes = getAllowedSchemesForHost(host, allowedSchemes)
    const url = generateBoltUrl(schemes, host)
    setState(prev => ({
      ...prev,
      host: url,
      hostInputVal: url
    }))
    error({})

    if (state.authenticationMethod === 'sso') {
      fetchHostDiscovery(url, setState)
    }
  }, [allowedSchemes, error, state.authenticationMethod])

  const onUsernameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, username: event.target.value }))
    error({})
  }, [error])

  const onPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, password: event.target.value }))
    error({})
  }, [error])

  const onAuthMethodChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const authenticationMethod = event.target.value as AuthenticationMethod
    const username = authenticationMethod === 'no-auth' 
      ? '' 
      : state.username || 'neo4j'
    const password = authenticationMethod === 'no-auth' 
      ? '' 
      : state.password

    setState(prev => ({
      ...prev,
      authenticationMethod,
      username,
      password
    }))

    if (authenticationMethod === 'sso') {
      fetchHostDiscovery(state.host, setState)
    }
    error({})
  }, [state.username, state.password, state.host, error])

  // Connection handlers
  const handleConnect = async () => {
    try {
      await login({
        username: state.username,
        password: state.password,
        host: state.host,
        authenticationMethod: state.authenticationMethod
      })
      onSuccess()
    } catch (err) {
      if (err instanceof Neo4jError) {
        handleConnectionError({ error: err })
      } else {
        error(err instanceof Error ? err : new Error('Connection failed'))
      }
    }
  }

  const handleConnectionError = useCallback((res: { error: Neo4jError }) => {
    if (res.error.code === 'Neo.ClientError.Security.CredentialsExpired') {
      setState(prev => ({ ...prev, passwordChangeNeeded: true }))
    } else if (
      !isAuraHost(state.host, NEO4J_CLOUD_DOMAINS) &&
      isNonSupportedRoutingSchemeError(res.error)
    ) {
      const url = toggleSchemeRouting(state.host)
      error(
        Error(
          `Could not connect with the "${getScheme(
            state.host
          )}://" scheme to this Neo4j server. Automatic retry using the "${getScheme(
            url
          )}://" scheme in a moment...`
        )
      )
      setState(prev => ({ 
        ...prev, 
        host: url, 
        hostInputVal: url 
      }))
      
      setTimeout(() => handleConnect(), 5000)
    } else {
      error(res.error)
    }
  }, [state.host, error, handleConnect])

  return (
    <StyledConnectionBody>
      {state.passwordChangeNeeded ? (
        <ChangePasswordForm
          showExistingPasswordInput={showExistingPasswordInput}
        />
      ) : isConnected ? (
        <ConnectedView frame={frame} />
      ) : (
        <ConnectForm
          {...state}
          onHostChange={onHostChange}
          onUsernameChange={onUsernameChange}
          onPasswordChange={onPasswordChange}
          onAuthMethodChange={onAuthMethodChange}
          onConnect={handleConnect}
        />
      )}
    </StyledConnectionBody>
  )
}

export default ConnectionFormController
