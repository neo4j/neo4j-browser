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
import InputEnterStepping from 'browser-components/InputEnterStepping/InputEnterStepping'
import { NATIVE, NO_AUTH } from 'services/bolt/boltHelpers'
import { toKeyString } from 'services/utils'
import { stripScheme, getScheme } from 'services/boltscheme.utils'

const readableauthenticationMethods = {
  [NATIVE]: 'Username / Password',
  [NO_AUTH]: 'No authentication'
}

export default function ConnectForm(props) {
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
  const onCopyBoltUrl = e => {
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
    e.clipboardData.setData('text', val)
  }

  const onHostChange = e => {
    const val = e.target.value
    props.onHostChange(getScheme(scheme), val)
  }

  const onSchemeChange = e => {
    const val = e.target.value
    props.onHostChange(getScheme(val), stripScheme(props.host))
  }

  const onConnectClick = () => {
    setConnecting(true)
    props.onConnectClick(() => setConnecting(false))
  }
  return (
    <StyledConnectionForm>
      <InputEnterStepping
        steps="3"
        submitAction={onConnectClick}
        render={({ getSubmitProps, getInputPropsForIndex, setRefForIndex }) => {
          return (
            <>
              <StyledConnectionFormEntry>
                <StyledConnectionLabel title="Pick neo4j:// for a routed connection, bolt:// for a direct connection to a DBMS instance.">
                  Connect URL
                </StyledConnectionLabel>
                {props.allowedSchemes && props.allowedSchemes.length ? (
                  <div>
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
                        {...getInputPropsForIndex(0, {
                          onCopy: onCopyBoltUrl,
                          initialFocus: true,
                          'data-testid': 'boltaddress',
                          onChange: onHostChange,
                          value: stripScheme(props.host),
                          ref: ref => setRefForIndex(0, ref)
                        })}
                      />
                    </StyledSegment>
                    <StyledBoltUrlHintText className="url-hint-text">
                      Pick neo4j:// for a routed connection, bolt:// for a
                      direct connection to a DBMS.
                    </StyledBoltUrlHintText>
                  </div>
                ) : (
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(0, {
                      initialFocus: true,
                      'data-testid': 'boltaddress',
                      onChange: onHostChange,
                      defaultValue: props.host,
                      ref: ref => setRefForIndex(0, ref)
                    })}
                  />
                )}
              </StyledConnectionFormEntry>
              <StyledConnectionFormEntry>
                <StyledConnectionLabel>
                  Authentication type
                </StyledConnectionLabel>
                <StyledConnectionSelect
                  {...getInputPropsForIndex(1, {
                    'data-testid': 'authenticationMethod',
                    onChange: props.onAuthenticationMethodChange,
                    value: props.authenticationMethod,
                    ref: ref => setRefForIndex(1, ref)
                  })}
                >
                  {[NATIVE, NO_AUTH].map((auth, i) => (
                    <option value={auth} key={i}>
                      {readableauthenticationMethods[auth]}
                    </option>
                  ))}
                </StyledConnectionSelect>
              </StyledConnectionFormEntry>

              {props.authenticationMethod === NATIVE && (
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>Username</StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(2, {
                      'data-testid': 'username',
                      onChange: props.onUsernameChange,
                      defaultValue: props.username,
                      ref: ref => setRefForIndex(2, ref)
                    })}
                  />
                </StyledConnectionFormEntry>
              )}

              {props.authenticationMethod === NATIVE && (
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>Password</StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(3, {
                      'data-testid': 'password',
                      onChange: props.onPasswordChange,
                      defaultValue: props.password,
                      type: 'password',
                      ref: ref => setRefForIndex(3, ref)
                    })}
                  />
                </StyledConnectionFormEntry>
              )}

              <Render if={!connecting}>
                <FormButton data-testid="connect" {...getSubmitProps()}>
                  Connect
                </FormButton>
              </Render>
              <Render if={connecting}>Connecting...</Render>
            </>
          )
        }}
      />
    </StyledConnectionForm>
  )
}
