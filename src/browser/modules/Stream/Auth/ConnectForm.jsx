/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { Component } from 'preact'
import {FormButton} from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'
import FormKeyHandler from 'browser-components/form/formKeyHandler'

export default class ConnectForm extends Component {
  componentWillMount () {
    this.formKeyHandler = new FormKeyHandler(this.props.onConnectClick)
  }
  componentDidMount () {
    this.formKeyHandler.initialize()
  }
  render () {
    return (
      <StyledConnectionForm>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Host</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => this.formKeyHandler.registerInput(el, 1)} onChange={this.props.onHostChange} value={this.props.host} />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Username</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => this.formKeyHandler.registerInput(el, 2)} onChange={this.props.onUsernameChange} value={this.props.username} />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Password</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => this.formKeyHandler.registerInput(el, 3)} onChange={this.props.onPasswordChange} value={this.props.password} type='password' />
        </StyledConnectionFormEntry>
        <FormButton onClick={this.props.onConnectClick}>Connect</FormButton>
      </StyledConnectionForm>
    )
  }
}
