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

import { authLog, authRequestForSSO, downloadAuthLogs } from 'neo4j-client-sso'
import React, { useEffect, useState } from 'react'

import { toKeyString } from 'neo4j-arc/common'

import { StyledCypherErrorMessage } from '../styled'
import {
  StyledBoltUrlHintText,
  StyledConnectionForm,
  StyledConnectionFormEntry,
  StyledConnectionLabel,
  StyledConnectionSelect,
  StyledConnectionTextInput,
  StyledFormContainer,
  StyledSSOButtonContainer,
  StyledSSOError,
  StyledSSOLogDownload,
  StyledSegment
} from './styled'
import { FormButton } from 'browser-components/buttons'
import { NATIVE, NO_AUTH, SSO } from 'services/bolt/boltHelpers'
import { getScheme, stripScheme } from 'services/boltscheme.utils'
import {
  AuthenticationMethod,
  SSOProvider
} from 'shared/modules/connections/connectionsDuck'
import { AUTH_STORAGE_CONNECT_HOST } from 'shared/services/utils'
import { hasReachableServer, Neo4jError } from 'neo4j-driver'
import AutoExecButton from '../auto-exec-button'
import { SmallSpinnerIcon } from 'browser-components/icons/LegacyIcons'

const readableauthenticationMethods: Record<AuthenticationMethod, string> = {
  [NATIVE]: 'Username / Password',
  [NO_AUTH]: 'No authentication',
  [SSO]: 'Single Sign On'
}

interface ConnectFormProps {
  allowedSchemes: string[]
  allowedAuthMethods: AuthenticationMethod[]
  authenticationMethod: string
  host: string
  onAuthenticationMethodChange: (event: any) => void
  onConnectClick: (doneFn?: () => void) => void
  onHostChange: (fallbackScheme: string, newHost: string) => void
  onUsernameChange: (event: any) => void
  onPasswordChange: (event: any) => void
  onDatabaseChange: (event: any) => void
  database: string
  password: string
  username: string
  used: boolean
  supportsMultiDb: boolean
  SSOError?: string
  SSOProviders: SSOProvider[]
  SSOLoading?: boolean
  onSSOProviderClicked: () => void
  connecting: boolean
  setIsConnecting: (c: boolean) => void
}

export type HttpReachablity =
  | { status: 'noRequest' }
  | { status: 'loading' }
  | { status: 'requestFailed'; error: Error }
  | { status: 'parsingJsonFailed'; error: Error }
  | { status: 'foundBoltPort' }
  | {
      status: 'foundAdvertisedBoltAddress'
      advertisedAddress: string
      redirected: boolean
    }
  | { status: 'foundOtherJSON'; json: Record<string, unknown> }

export async function httpReachabilityCheck(
  url: string
): Promise<HttpReachablity> {
  let res
  try {
    res = await fetch(url, {
      method: 'get',
      headers: {
        Accept: 'application/json'
      }
    })
  } catch (error) {
    return { status: 'requestFailed', error: error as Error }
  }

  let json
  try {
    json = await res.json()
  } catch (error) {
    return { status: 'parsingJsonFailed', error: error as Error }
  }

  const isNeo4jDiscoveryData =
    'auth_config' in json && 'oidc_providers' in json.auth_config

  if (!isNeo4jDiscoveryData) {
    return { status: 'foundOtherJSON', json }
  }

  const advertisedAddress = json.bolt_routing ?? json.bolt_direct
  if (advertisedAddress) {
    return {
      status: 'foundAdvertisedBoltAddress',
      advertisedAddress,
      redirected: res.redirected
    }
  } else {
    return { status: 'foundBoltPort' }
  }
}

export async function boltReachabilityCheck(url: string, secure?: boolean) {
  try {
    // The encryption flag needs to be set explicitly to disable automatic switching to match hosting
    // @ts-ignore signature is wrong
    await hasReachableServer(url, {
      ...(secure !== undefined ? { encrypted: secure } : undefined)
    })
    return true
  } catch (e) {
    return e as Neo4jError
  }
}

export default function ConnectForm(props: ConnectFormProps): JSX.Element {
  const [scheme, setScheme] = useState(
    props.allowedSchemes ? `${getScheme(props.host)}://` : ''
  )

  useEffect(() => {
    if (props.allowedSchemes) {
      return setScheme(`${getScheme(props.host)}://`)
    }
    setScheme('')
  }, [props.host, props.allowedSchemes])

  // Add scheme when copying text from bolt url field
  const onCopyBoltUrl = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const selection = document.getSelection()
    if (!selection) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    let val = selection.toString()
    if (scheme) {
      val = `${scheme}${stripScheme(val)}`
    }
    e.clipboardData?.setData('text', val)
  }

  async function reachabilityCheck(url: string) {
    setReachablityState('loading')
    const res = await httpReachabilityCheck(`//${stripScheme(url)}`)

    // Being reachable by http is not a requirement (you could have some really odd network setup)
    // But if it doesn't work though, it is likely the connection will time out which can take a while
    // we use this state to set a warning in the UI
    if (res.status === 'parsingJsonFailed' || res.status === 'foundOtherJSON') {
      setReachablityState('probablyFailed')
    }

    const boltStatus = await boltReachabilityCheck(url)
    setReachablityState(boltStatus === true ? 'succeeded' : 'failed')
  }

  const onHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReachablityState('no_attempt')
    const val = e.target.value
    props.onHostChange(getScheme(scheme), val)
  }

  const onSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value

    reachabilityCheck(val + stripScheme(props.host))
    props.onHostChange(getScheme(val), stripScheme(props.host))
  }

  const onConnectClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    props.setIsConnecting(true)
    props.onConnectClick(() => props.setIsConnecting(false))
  }

  const hasSecureSchemes = ['neo4j+s', 'bolt+s'].every(scheme =>
    props.allowedSchemes.includes(scheme)
  )
  const schemeRestriction = props.allowedSchemes.length > 0
  const schemeMultiple = props.allowedSchemes.length > 1

  const hoverText = schemeMultiple
    ? `Pick neo4j${
        hasSecureSchemes ? '+s' : ''
      }:// for a routed connection (Aura, Cluster), bolt${
        hasSecureSchemes ? '+s' : ''
      }:// for a direct connection to a single instance.`
    : ''

  const { SSOError, SSOProviders, SSOLoading } = props
  const [SSORedirectError, setRedirectError] = useState('')

  const [reachabilityState, setReachablityState] = useState<
    'no_attempt' | 'loading' | 'probablyFailed' | 'failed' | 'succeeded'
  >('no_attempt')

  useEffect(() => {
    if (stripScheme(props.host) !== '') {
      reachabilityCheck(props.host)
    }
  }, [])

  return (
    <StyledFormContainer>
      <StyledConnectionForm onSubmit={onConnectClick}>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel htmlFor="url-input" title={hoverText}>
            Connect URL{' '}
            <span
              style={{ fontStyle: 'italic' }}
              title="" /* reset parent title */
            >
              {reachabilityState === 'loading' && <SmallSpinnerIcon />}
              {reachabilityState === 'probablyFailed' && (
                <span style={{ color: 'orange' }}>
                  <SmallSpinnerIcon /> Connection will probably time out.
                </span>
              )}
              {reachabilityState === 'failed' && (
                <>
                  {' '}
                  - Could not reach Neo4j.{' '}
                  {props.host.includes('localhost') &&
                    !props.host.includes('localhost:7687') &&
                    '(default port is 7687) '}
                  <AutoExecButton
                    displayText=":debug"
                    cmd={`debug connectivity ${props.host}`}
                  />
                </>
              )}
            </span>
          </StyledConnectionLabel>
          {schemeRestriction ? (
            <>
              <StyledSegment>
                <StyledConnectionSelect
                  onChange={onSchemeChange}
                  value={scheme}
                  data-testid="bolt-scheme-select"
                >
                  {props.allowedSchemes.map(s => {
                    const schemeString = `${s}://`
                    return (
                      <option value={schemeString} key={toKeyString(s)}>
                        {schemeString}
                      </option>
                    )
                  })}
                </StyledConnectionSelect>
                <StyledConnectionTextInput
                  style={
                    reachabilityState === 'failed'
                      ? { outline: 'red 1px solid' }
                      : {}
                  }
                  onCopy={onCopyBoltUrl}
                  data-testid="boltaddress"
                  onChange={onHostChange}
                  value={stripScheme(props.host)}
                  id="url-input"
                  onBlur={() => reachabilityCheck(props.host)}
                />
              </StyledSegment>
              <StyledBoltUrlHintText className="url-hint-text">
                {hoverText}
              </StyledBoltUrlHintText>
            </>
          ) : (
            <StyledConnectionTextInput
              data-testid="boltaddress"
              onChange={onHostChange}
              defaultValue={props.host}
              onBlur={() => reachabilityCheck(props.host)}
            />
          )}
        </StyledConnectionFormEntry>

        {props.supportsMultiDb && (
          <StyledConnectionFormEntry>
            <StyledConnectionLabel>
              Database - leave empty for default
              <StyledConnectionTextInput
                data-testid="database"
                onChange={props.onDatabaseChange}
                value={props.database}
              />
            </StyledConnectionLabel>
          </StyledConnectionFormEntry>
        )}

        {props.allowedAuthMethods.length > 1 && (
          <StyledConnectionFormEntry>
            <StyledConnectionLabel>
              Authentication type
              <StyledConnectionSelect
                data-testid="authenticationMethod"
                onChange={props.onAuthenticationMethodChange}
                value={props.authenticationMethod}
              >
                {props.allowedAuthMethods.map(auth => (
                  <option value={auth} key={auth}>
                    {readableauthenticationMethods[auth]}
                  </option>
                ))}
              </StyledConnectionSelect>
            </StyledConnectionLabel>
          </StyledConnectionFormEntry>
        )}

        {props.authenticationMethod === NATIVE && (
          <StyledConnectionFormEntry>
            <StyledConnectionLabel>
              Username
              <StyledConnectionTextInput
                data-testid="username"
                onChange={props.onUsernameChange}
                defaultValue={props.username}
              />
            </StyledConnectionLabel>
          </StyledConnectionFormEntry>
        )}

        {props.authenticationMethod === NATIVE && (
          <StyledConnectionFormEntry>
            <StyledConnectionLabel>
              Password
              <StyledConnectionTextInput
                data-testid="password"
                onChange={props.onPasswordChange}
                defaultValue={props.password}
                type="password"
                autoComplete="off"
              />
            </StyledConnectionLabel>
          </StyledConnectionFormEntry>
        )}

        {props.authenticationMethod === SSO &&
          !SSOLoading &&
          SSOProviders.filter(provider => {
            return 'visible' in provider ? provider.visible : true
          }).map((provider: SSOProvider) => (
            <StyledSSOButtonContainer key={provider.id}>
              <FormButton
                onClick={() => {
                  props.onSSOProviderClicked()
                  sessionStorage.setItem(AUTH_STORAGE_CONNECT_HOST, props.host)
                  authRequestForSSO(provider).catch(e => {
                    authLog(e.message)
                    setRedirectError(e.message)
                  })
                }}
                style={{ width: '200px' }}
              >
                {provider.name}
              </FormButton>
            </StyledSSOButtonContainer>
          ))}
        {props.authenticationMethod === SSO &&
          !SSOLoading &&
          (SSOError || SSORedirectError) && (
            <>
              <StyledSSOError>
                <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
                <div>{SSOError || SSORedirectError}</div>
              </StyledSSOError>
              <StyledSSOLogDownload onClick={downloadAuthLogs}>
                Download browser SSO logs
              </StyledSSOLogDownload>
            </>
          )}

        {props.connecting
          ? 'Connecting...'
          : props.authenticationMethod !== SSO && (
              <span
                title={
                  reachabilityState === 'succeeded'
                    ? 'Connect.'
                    : 'Make sure a neo4j server is reachable at the connect URL.'
                }
              >
                <FormButton
                  data-testid="connect"
                  type="submit"
                  style={{
                    marginRight: 0,
                    opacity: reachabilityState === 'succeeded' ? 1 : 0.4
                  }}
                >
                  Connect
                </FormButton>
              </span>
            )}
      </StyledConnectionForm>
    </StyledFormContainer>
  )
}
