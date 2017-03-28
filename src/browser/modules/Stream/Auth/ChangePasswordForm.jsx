import { Component } from 'preact'

import {FormButton} from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'

export default class ChangePasswordForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      newPassword: '',
      newPassword2: ''
    }
  }
  componentDidMount () {
    if (!this.props.children) { // Children means an 'existing password' field. That should take focus instead.
      this.firstInput.focus()
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
    if (this.state.newPassword && this.state.newPassword !== '' && this.state.newPassword !== this.state.newPassword2) {
      return this.props.onChangePasswordClick({error: {code: 'Mismatch', message: 'The two entered passwords must be the same.'}})
    }
    this.props.onChangePasswordClick({ newPassword: this.state.newPassword })
  }
  render () {
    return (
      <StyledConnectionForm>
        {this.props.children}
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>New password</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => (this.firstInput = el)} type='password' onChange={this.onNewPasswordChange.bind(this)} value={this.state.newPassword} />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Repeat new password</StyledConnectionLabel>
          <StyledConnectionTextInput type='password' onChange={this.onNewPasswordChange2.bind(this)} value={this.state.newPassword2} />
        </StyledConnectionFormEntry>
        <FormButton onClick={this.validateSame.bind(this)} label='Change password' />
      </StyledConnectionForm>
    )
  }
}
