import { Component } from 'preact'
import {FormButton} from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'

export default class ConnectForm extends Component {
  componentDidMount () {
    this.firstInput.focus()
  }
  render () {
    return (
      <StyledConnectionForm>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Host</StyledConnectionLabel>
          <StyledConnectionTextInput innerRef={(el) => (this.firstInput = el)} onChange={this.props.onHostChange} value={this.props.host} />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Username</StyledConnectionLabel>
          <StyledConnectionTextInput onChange={this.props.onUsernameChange} value={this.props.username} />
        </StyledConnectionFormEntry>
        <StyledConnectionFormEntry>
          <StyledConnectionLabel>Password</StyledConnectionLabel>
          <StyledConnectionTextInput onChange={this.props.onPasswordChange} value={this.props.password} type='password' />
        </StyledConnectionFormEntry>
        <FormButton onClick={this.props.onConnectClick}>Connect</FormButton>
      </StyledConnectionForm>
    )
  }
}
