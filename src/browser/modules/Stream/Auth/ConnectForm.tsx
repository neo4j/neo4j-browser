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

import React, { useState, useEffect } from 'react'
import Render from 'browser-components/Render'
import { FormButton } from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionSelect,
  StyledConnectionLabel,
  StyledConnectionFormEntry,
  StyledSegment,
  StyledBoltUrlHintText,
  FormContainer,
  SsoOptions,
  SsoButtonContainer,
  SsoError
} from './styled'
import { NATIVE, NO_AUTH } from 'services/bolt/boltHelpers'
import { toKeyString } from 'services/utils'
import { stripScheme, getScheme } from 'services/boltscheme.utils'
import { AuthenticationMethod } from 'shared/modules/connections/connectionsDuck'
import { authRequestForSSO } from 'shared/modules/auth/index.js'
import { getSSOProvidersFromStorage } from 'shared/modules/auth/common.js'
import { H3 } from 'browser-components/headers'
import { StyledCypherErrorMessage } from '../styled'

const readableauthenticationMethods: Record<AuthenticationMethod, string> = {
  [NATIVE]: 'Username / Password',
  [NO_AUTH]: 'No authentication'
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
  ssoError?: string
}

export default function ConnectForm(props: ConnectFormProps): JSX.Element {
  const [connecting, setConnecting] = useState(false)
  const [scheme, setScheme] = useState(
    props.allowedSchemes ? `${getScheme(props.host)}://` : ''
  )
  const [ssoProviders, setSsoProviders] = useState<any[]>([])

  useEffect(() => {
    setSsoProviders(getSSOProvidersFromStorage())
  }, [])

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

  const onHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    props.onHostChange(getScheme(scheme), val)
  }

  const onSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    props.onHostChange(getScheme(val), stripScheme(props.host))
  }

  const onConnectClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setConnecting(true)
    props.onConnectClick(() => setConnecting(false))
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

  const { ssoError } = props
  return (
    <FormContainer>
      {ssoProviders.length > 0 && (
        <SsoOptions>
          <H3>Single sign-on</H3>
          {ssoProviders.map((provider: any) => (
            <SsoButtonContainer key={provider.id}>
              <FormButton onClick={() => authRequestForSSO(provider.id)}>
                {provider.name}
              </FormButton>
            </SsoButtonContainer>
          ))}
          {ssoError && (
            <SsoError>
              <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
              <div>{ssoError}</div>
            </SsoError>
          )}
        </SsoOptions>
      )}
      <StyledConnectionForm onSubmit={onConnectClick}>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel htmlFor="url-input" title={hoverText}>
            Connect URL
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
                  onCopy={onCopyBoltUrl}
                  data-testid="boltaddress"
                  onChange={onHostChange}
                  value={stripScheme(props.host)}
                  id="url-input"
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
              />
            </StyledConnectionLabel>
          </StyledConnectionFormEntry>
        )}

        <Render if={!connecting}>
          <FormButton
            data-testid="connect"
            type="submit"
            style={{ marginRight: 0 }}
          >
            Connect
          </FormButton>
        </Render>
        <Render if={connecting}>Connecting...</Render>
      </StyledConnectionForm>
    </FormContainer>
  )
}
