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

import React, { Component } from 'react'
import faker from 'faker'
import { FormButton } from 'browser-components/buttons'
import {
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry,
  StyledChangePasswordForm
} from './styled'
import Render from 'browser-components/Render'
import InputEnterStepping from 'browser-components/InputEnterStepping/InputEnterStepping'
import RevealablePasswordInput from './revealable-password-input'

export default class ChangePasswordForm extends Component {
  constructor(props) {
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

  onSuggestPassword = () => {
    this.setState({
      newPassword: `${faker.random.words(3)} ${faker.random.number(100)}`
    })
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

  render() {
    const indexStart = this.props.showExistingPasswordInput ? 1 : 0
    const { isLoading } = this.props
    const classNames = []
    if (isLoading) {
      classNames.push('isLoading')
    }
    return (
      <StyledChangePasswordForm className={classNames.join(' ')}>
        <InputEnterStepping
          steps={this.props.showExistingPasswordInput ? 3 : 2}
          submitAction={this.validateSame}
          render={({
            getSubmitProps,
            getInputPropsForIndex,
            setRefForIndex
          }) => {
            return (
              <>
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
                        ref: ref => setRefForIndex(0, ref),
                        disabled: isLoading
                      })}
                    />
                  </StyledConnectionFormEntry>
                </Render>
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>New password</StyledConnectionLabel>
                  <RevealablePasswordInput
                    {...getInputPropsForIndex(indexStart, {
                      initialFocus: !this.props.showExistingPasswordInput,
                      'data-testid': 'newPassword',
                      type: 'password',
                      onChange: this.onNewPasswordChange,
                      value: this.state.newPassword,
                      setRef: ref => setRefForIndex(indexStart, ref),
                      disabled: isLoading
                    })}
                  />
                  &nbsp;OR&nbsp;
                  <FormButton tabIndex="-1" onClick={this.onSuggestPassword}>
                    Generate
                  </FormButton>
                </StyledConnectionFormEntry>
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>
                    Repeat new password
                  </StyledConnectionLabel>
                  <RevealablePasswordInput
                    {...getInputPropsForIndex(indexStart + 1, {
                      'data-testid': 'newPasswordConfirmation',
                      type: 'password',
                      onChange: this.onNewPasswordChange2,
                      value: this.state.newPassword2,
                      setRef: ref => setRefForIndex(indexStart + 1, ref),
                      disabled: isLoading
                    })}
                  />
                </StyledConnectionFormEntry>
                <Render if={!isLoading}>
                  <FormButton
                    data-testid="changePassword"
                    label="Change password"
                    disabled={isLoading}
                    {...getSubmitProps()}
                  />
                </Render>
                <Render if={isLoading}>Please wait...</Render>
              </>
            )
          }}
        />
      </StyledChangePasswordForm>
    )
  }
}
