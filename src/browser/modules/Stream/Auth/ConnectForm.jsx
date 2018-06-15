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
import FormKeyHandler from 'browser-components/form/formKeyHandler'

export default class ConnectForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      connecting: false
    }
  }
  componentWillMount () {
    this.formKeyHandler = new FormKeyHandler(this.onConnectClick.bind(this))
  }
  componentDidMount () {
    this.formKeyHandler.initialize(this.props.used === false)
  }
  onConnectClick () {
    this.setState({ connecting: true }, () => {
      this.props.onConnectClick(() => this.setState({ connecting: false }))
    })
  }
  render () {
    return (
      <StyledConnectionForm>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Host</StyledConnectionLabel>
          <StyledConnectionTextInput
            data-test-id='boltaddress'
            innerRef={el => this.formKeyHandler.registerInput(el, 1)}
            onChange={this.props.onHostChange}
            defaultValue={this.props.host}
          />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Username</StyledConnectionLabel>
          <StyledConnectionTextInput
            data-test-id='username'
            innerRef={el => this.formKeyHandler.registerInput(el, 2)}
            onChange={this.props.onUsernameChange}
            defaultValue={this.props.username}
          />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Password</StyledConnectionLabel>
          <StyledConnectionTextInput
            data-test-id='password'
            innerRef={el => this.formKeyHandler.registerInput(el, 3)}
            onChange={this.props.onPasswordChange}
            defaultValue={this.props.password}
            type='password'
          />
        </StyledConnectionFormEntry>
        <Render if={!this.state.connecting}>
          <FormButton
            data-test-id='connect'
            onClick={this.onConnectClick.bind(this)}
          >
            Connect
          </FormButton>
        </Render>
        <Render if={this.state.connecting}>Connecting...</Render>
      </StyledConnectionForm>
    )
  }
}
