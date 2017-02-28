import React from 'react'

import Form from 'grommet/components/Form'
import FormField from 'grommet/components/FormField'
import FormFields from 'grommet/components/FormFields'
import Footer from 'grommet/components/Footer'
import {FormButton} from 'nbnmui/buttons'
import TextInput from 'grommet/components/TextInput'

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
      <div>
        <Form>
          <FormFields>
            <FormField label='New password'>
              <TextInput type='password' onDOMChange={this.onNewPasswordChange.bind(this)} value={this.state.newPassword} />
            </FormField>
            <FormField label='Repeat new password'>
              <TextInput type='password' onDOMChange={this.onNewPasswordChange2.bind(this)} value={this.state.newPassword2} />
            </FormField>
          </FormFields>
        </Form>
        <Footer>
          <FormButton onClick={this.validateSame.bind(this)}>Change password</FormButton>
        </Footer>
      </div>
    )
  }
}
