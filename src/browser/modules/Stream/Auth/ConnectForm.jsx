/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import React, { Component } from 'react'
import Render from 'browser-components/Render'
import { FormButton } from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'
import InputEnterStepping from 'browser-components/InputEnterStepping/InputEnterStepping'

export default class ConnectForm extends Component {
  state = {
    connecting: false
  }
  onConnectClick = () => {
    this.setState({ connecting: true }, () => {
      this.props.onConnectClick(() => this.setState({ connecting: false }))
    })
  }
  render () {
    return (
      <StyledConnectionForm>
        <InputEnterStepping
          steps='3'
          submitAction={this.onConnectClick}
          render={({
            getSubmitProps,
            getInputPropsForIndex,
            setRefForIndex
          }) => {
            return (
              <React.Fragment>
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>Connect URL</StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(0, {
                      initialFocus: true,
                      'data-testid': 'boltaddress',
                      onChange: this.props.onHostChange,
                      defaultValue: this.props.host,
                      ref: ref => setRefForIndex(0, ref)
                    })}
                  />
                </StyledConnectionFormEntry>

                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>Username</StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(1, {
                      'data-testid': 'username',
                      onChange: this.props.onUsernameChange,
                      defaultValue: this.props.username,
                      ref: ref => setRefForIndex(1, ref)
                    })}
                  />
                </StyledConnectionFormEntry>

                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>Password</StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(2, {
                      'data-testid': 'password',
                      onChange: this.props.onPasswordChange,
                      defaultValue: this.props.password,
                      type: 'password',
                      ref: ref => setRefForIndex(2, ref)
                    })}
                  />
                </StyledConnectionFormEntry>

                <Render if={!this.state.connecting}>
                  <FormButton data-testid='connect' {...getSubmitProps()}>
                    Connect
                  </FormButton>
                </Render>
                <Render if={this.state.connecting}>Connecting...</Render>
              </React.Fragment>
            )
          }}
        />
      </StyledConnectionForm>
    )
  }
}
