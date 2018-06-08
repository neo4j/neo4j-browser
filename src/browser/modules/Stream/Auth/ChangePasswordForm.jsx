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

import { FormButton } from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'
import FormKeyHandler from 'browser-components/form/formKeyHandler'

export default class ChangePasswordForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      newPassword: '',
      newPassword2: ''
    }
  }
  componentDidMount () {
    this.formKeyHandler.initialize()
  }
  componentWillMount () {
    if (!this.props.formKeyHandler) {
      this.formKeyHandler = new FormKeyHandler(this.validateSame.bind(this))
    } else {
      this.formKeyHandler = this.props.formKeyHandler
      this.formKeyHandler.registerSubmit(this.validateSame.bind(this))
    }
  }

  onNewPasswordChange (event) {
    const newPassword = event.target.value
    this.setState({ newPassword, error: {} }, () => this.onChange())
  }
  onNewPasswordChange2 (event) {
    const newPassword2 = event.target.value
    this.setState({ newPassword2, error: {} }, () => this.onChange())
  }
  onChange () {
    this.props.onChange(this.state.newPassword, this.state.newPassword2)
  }
  validateSame () {
    if (
      this.state.newPassword &&
      this.state.newPassword !== '' &&
      this.state.newPassword !== this.state.newPassword2
    ) {
      return this.props.onChangePasswordClick({
        error: {
          code: 'Mismatch',
          message: 'The two entered passwords must be the same.'
        }
      })
    }
    this.props.onChangePasswordClick({ newPassword: this.state.newPassword })
  }

  render () {
    const inputTabOffset = this.props.children.length
    return (
      <StyledConnectionForm>
        {this.props.children}
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>New password</StyledConnectionLabel>
          <StyledConnectionTextInput
            data-test-id='newPassword'
            innerRef={el =>
              this.formKeyHandler.registerInput(el, 1 + inputTabOffset)}
            type='password'
            onChange={this.onNewPasswordChange.bind(this)}
            value={this.state.newPassword}
          />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Repeat new password</StyledConnectionLabel>
          <StyledConnectionTextInput
            data-test-id='newPasswordConfirmation'
            innerRef={el =>
              this.formKeyHandler.registerInput(el, 2 + inputTabOffset)}
            type='password'
            onChange={this.onNewPasswordChange2.bind(this)}
            value={this.state.newPassword2}
          />
        </StyledConnectionFormEntry>
        <FormButton
          data-test-id='changePassword'
          onClick={this.validateSame.bind(this)}
          label='Change password'
        />
      </StyledConnectionForm>
    )
  }
}
