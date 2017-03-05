import React from 'react'

import {FormButton} from 'nbnmui/buttons'

export default class ChangePasswordForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPassword: '',
      newPassword2: ''
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
    if (this.state.newPassword && this.state.newPassword !== this.state.newPassword2) {
      return this.props.onChangePasswordClick({error: {code: 'Mismatch', message: 'The two entered passwords must be the same.'}})
    }
    this.props.onChangePasswordClick({ newPassword: this.state.newPassword })
  }
  render () {
    return (
      <form>
        <ul>
          <li>
            <label>New password</label>
            <input type='password' onChange={this.onNewPasswordChange.bind(this)} value={this.state.newPassword} />
          </li>
          <li>
            <label>Repeat new password</label>
            <input type='password' onChange={this.onNewPasswordChange2.bind(this)} value={this.state.newPassword2} />
          </li>
        </ul>
        <FormButton onClick={this.validateSame.bind(this)} label='Change password' />
      </form>
    )
  }
}
