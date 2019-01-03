/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import React, { Component } from 'react'
import { FormButton } from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'
import Render from 'browser-components/Render'
import InputEnterStepping from 'browser-components/InputEnterStepping/InputEnterStepping'

export default class ChangePasswordForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      password: '',
      newPassword: '',
      newPassword2: ''
    }
  }
  onExistingPasswordChange = event => {
    const password = event.target.value
    this.setState({ password, error: {} }, () => this.onChange())
  }
  onNewPasswordChange = event => {
    const newPassword = event.target.value
    this.setState({ newPassword, error: {} }, () => this.onChange())
  }
  onNewPasswordChange2 = event => {
    const newPassword2 = event.target.value
    this.setState({ newPassword2, error: {} }, () => this.onChange())
  }
  onChange = () => {
    this.props.onChange(this.state.newPassword, this.state.newPassword2)
  }
  validateSame = () => {
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

    if (this.props.showExistingPasswordInput && this.props.tryConnect) {
      this.props.tryConnect(this.state.password, res => {
        if (res.success) {
          this.props.onChangePasswordClick({
            newPassword: this.state.newPassword
          })
          return
        }
        this.props.onChangePasswordClick(res)
      })
    } else {
      this.props.onChangePasswordClick({
        newPassword: this.state.newPassword
      })
    }
  }
  render () {
    const indexStart = this.props.showExistingPasswordInput ? 1 : 0
    return (
      <StyledConnectionForm>
        <InputEnterStepping
          steps={this.props.showExistingPasswordInput ? 3 : 2}
          submitAction={this.validateSame}
          render={({
            getSubmitProps,
            getInputPropsForIndex,
            setRefForIndex
          }) => {
            return (
              <React.Fragment>
                <Render if={this.props.showExistingPasswordInput}>
                  <StyledConnectionFormEntry>
                    <StyledConnectionLabel>
                      Existing password
                    </StyledConnectionLabel>
                    <StyledConnectionTextInput
                      {...getInputPropsForIndex(0, {
                        initialFocus: true,
                        type: 'password',
                        onChange: this.onExistingPasswordChange,
                        value: this.state.password,
                        ref: ref => setRefForIndex(0, ref)
                      })}
                    />
                  </StyledConnectionFormEntry>
                </Render>
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>New password</StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(indexStart, {
                      initialFocus: !this.props.showExistingPasswordInput,
                      'data-testid': 'newPassword',
                      type: 'password',
                      onChange: this.onNewPasswordChange,
                      value: this.state.newPassword,
                      ref: ref => setRefForIndex(indexStart, ref)
                    })}
                  />
                </StyledConnectionFormEntry>
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>
                    Repeat new password
                  </StyledConnectionLabel>
                  <StyledConnectionTextInput
                    {...getInputPropsForIndex(indexStart + 1, {
                      'data-testid': 'newPasswordConfirmation',
                      type: 'password',
                      onChange: this.onNewPasswordChange2,
                      value: this.state.newPassword2,
                      ref: ref => setRefForIndex(indexStart + 1, ref)
                    })}
                  />
                </StyledConnectionFormEntry>
                <FormButton
                  data-testid='changePassword'
                  label='Change password'
                  {...getSubmitProps()}
                />
              </React.Fragment>
            )
          }}
        />
      </StyledConnectionForm>
    )
  }
}
