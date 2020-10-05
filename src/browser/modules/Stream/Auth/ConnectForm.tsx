/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
  StyledBoltUrlHintText
} from './styled'
import { NATIVE, NO_AUTH } from 'services/bolt/boltHelpers'
import { toKeyString } from 'services/utils'
import { stripScheme, getScheme } from 'services/boltscheme.utils'

type AuthenticationMethod = typeof NATIVE | typeof NO_AUTH
const authMethods: AuthenticationMethod[] = [NATIVE, NO_AUTH]
const readableauthenticationMethods: Record<AuthenticationMethod, string> = {
  [NATIVE]: 'Username / Password',
  [NO_AUTH]: 'No authentication'
}

interface ConnectFormProps {
  allowedSchemes: string[]
  authenticationMethod: string
  host: string
  onAuthenticationMethodChange: () => void
  onConnectClick: (doneFn?: () => void) => void
  onHostChange: (fallbackScheme: string, newHost: string) => void
  onUsernameChange: () => void
  onPasswordChange: () => void
  onDatabaseChange: () => void
  database: string
  password: string
  username: string
  used: boolean
  supportsMultiDb: boolean
}

export default function ConnectForm(props: ConnectFormProps): JSX.Element {
  const [connecting, setConnecting] = useState(false)
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

  return (
    <StyledConnectionForm onSubmit={onConnectClick}>
      <StyledConnectionFormEntry>
        <StyledConnectionLabel
          htmlFor="url-input"
          title="Pick neo4j:// for a routed connection, bolt:// for a direct connection to a DBMS instance."
        >
          Connect URL
        </StyledConnectionLabel>
        {props.allowedSchemes && props.allowedSchemes.length ? (
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
              Pick neo4j:// for a routed connection, bolt:// for a direct
              connection to a DBMS.
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

      <StyledConnectionFormEntry>
        <StyledConnectionLabel>
          Authentication type
          <StyledConnectionSelect
            data-testid="authenticationMethod"
            onChange={props.onAuthenticationMethodChange}
            value={props.authenticationMethod}
          >
            {authMethods.map(auth => (
              <option value={auth} key={auth}>
                {readableauthenticationMethods[auth]}
              </option>
            ))}
          </StyledConnectionSelect>
        </StyledConnectionLabel>
      </StyledConnectionFormEntry>

      {props.authenticationMethod === NATIVE && (
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>
            Username
            <StyledConnectionTextInput
              data-testid="username"
              onChange={props.onUsernameChange}
              defaultValue={props.username}
              required
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
              required
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
  )
}
