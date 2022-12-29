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
import React, { Component } from 'react'

import RevealablePasswordInput from './revealable-password-input'
import {
  StyledChangePasswordForm,
  StyledConnectionFormEntry,
  StyledConnectionLabel,
  StyledConnectionTextInput
} from './styled'
import { getRandomWords } from './utils'
import InputEnterStepping from 'browser-components/InputEnterStepping/InputEnterStepping'
import { FormButton } from 'browser-components/buttons'

type State = any

export default class ChangePasswordForm extends Component<any, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      password: '',
      newPassword: '',
      newPassword2: '',
      revealNewPassword: false
    }
  }

  onExistingPasswordChange = (event: any) => {
    const password = event.target.value
    this.setState({ password }, () => this.props.onChange())
  }

  onNewPasswordChange = (event: any) => {
    const newPassword = event.target.value
    this.setState({ newPassword }, () => this.props.onChange())
  }

  onNewPasswordChange2 = (event: any) => {
    const newPassword2 = event.target.value
    this.setState({ newPassword2 }, () => this.props.onChange())
  }

  onSuggestPassword = () => {
    const suggestedPassword = `${getRandomWords(5).join('-')}-${Math.floor(
      Math.random() * 10000
    )}`
    this.setState({
      newPassword: suggestedPassword,
      newPassword2: suggestedPassword,
      revealNewPassword: true
    })
  }

  togglePasswordRevealed = () =>
    this.setState((state: any) => ({
      revealNewPassword: !state.revealNewPassword
    }))

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
      this.props.tryConnect(this.state.password, (res: any) => {
        if (res.success) {
          this.props.onChangePasswordClick({
            newPassword: this.state.newPassword
          })
        } else {
          this.props.onChangePasswordClick(res)
        }
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
          }: any) => {
            return (
              <>
                {this.props.showExistingPasswordInput && (
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
                        ref: (ref: any) => setRefForIndex(0, ref),
                        disabled: isLoading,
                        autoComplete: 'off'
                      })}
                    />
                  </StyledConnectionFormEntry>
                )}
                <StyledConnectionFormEntry>
                  <StyledConnectionLabel>New password</StyledConnectionLabel>
                  <RevealablePasswordInput
                    {...getInputPropsForIndex(indexStart, {
                      initialFocus: !this.props.showExistingPasswordInput,
                      'data-testid': 'newPassword',
                      type: 'password',
                      onChange: this.onNewPasswordChange,
                      value: this.state.newPassword,
                      setRef: (ref: any) => setRefForIndex(indexStart, ref),
                      disabled: isLoading,
                      isRevealed: this.state.revealNewPassword,
                      toggleReveal: this.togglePasswordRevealed,
                      autoComplete: 'new-password'
                    })}
                  />
                  &nbsp;OR&nbsp;&nbsp;
                  <FormButton tabIndex={-1} onClick={this.onSuggestPassword}>
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
                      setRef: (ref: any) => setRefForIndex(indexStart + 1, ref),
                      disabled: isLoading,
                      isRevealed: this.state.revealNewPassword,
                      toggleReveal: this.togglePasswordRevealed,
                      autoComplete: 'new-password'
                    })}
                  />
                </StyledConnectionFormEntry>
                {isLoading ? (
                  'Please wait...'
                ) : (
                  <FormButton
                    data-testid="changePassword"
                    label="Change password"
                    disabled={isLoading}
                    {...getSubmitProps()}
                  />
                )}
              </>
            )
          }}
        />
      </StyledChangePasswordForm>
    )
  }
}
