import { Component } from 'preact'

import {FormButton} from 'browser-components/buttons'
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
      this.formKeyHandler.regsiterSubmit(this.validateSame.bind(this))
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
    const inputTabOffset = this.props.children ? 1 : 0
    return (
      <StyledConnectionForm>
        {this.props.children}
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>New password</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => this.formKeyHandler.registerInput(el, 1 + inputTabOffset)} type='password' onChange={this.onNewPasswordChange.bind(this)} value={this.state.newPassword} />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Repeat new password</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => this.formKeyHandler.registerInput(el, 2 + inputTabOffset)} type='password' onChange={this.onNewPasswordChange2.bind(this)} value={this.state.newPassword2} />
        </StyledConnectionFormEntry>
        <FormButton onClick={this.validateSame.bind(this)} label='Change password' />
      </StyledConnectionForm>
    )
  }
}

