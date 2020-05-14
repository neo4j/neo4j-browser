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

import React, { useState } from 'react'
import Render from 'browser-components/Render'
import { FormButton } from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionSelect,
  StyledConnectionLabel,
  StyledConnectionFormEntry,
  StyledSegment
} from './styled'
import InputEnterStepping from 'browser-components/InputEnterStepping/InputEnterStepping'
import { NATIVE, NO_AUTH } from 'services/bolt/boltHelpers'
import { stripScheme } from 'services/utils'

const readableauthenticationMethods = {
  [NATIVE]: 'Username / Password',
  [NO_AUTH]: 'No authentication'
}

export default function ConnectForm(props) {
  const [connecting, setConnecting] = useState(false)

  // Add scheme when copying text from bult url field
  const onCopyBoltUrl = e => {
    let selection = document.getSelection()
    if (!selection) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    let val = selection.toString()
    if (props.enforcedScheme) {
      val = `${props.enforcedScheme}${stripScheme(val)}`
    }
    e.clipboardData.setData('text', val)
  }

  const onHostChange = e => {
    let val = e.target.value
    if (props.enforcedScheme) {
      val = `${props.enforcedScheme}${stripScheme(val)}`
    }
    props.onHostChange(val)
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
                <StyledConnectionLabel>Connect URL</StyledConnectionLabel>
                {props.enforcedScheme ? (
                  <StyledSegment>
                    <div>{props.enforcedScheme}</div>
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
