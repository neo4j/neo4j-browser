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
