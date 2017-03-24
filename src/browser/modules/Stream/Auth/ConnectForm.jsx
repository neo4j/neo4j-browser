import {FormButton} from 'browser-components/buttons'
import {
  StyledConnectionForm,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'

const ConnectForm = (props) => (
  <StyledConnectionForm>
    <StyledConnectionFormEntry>
      <StyledConnectionLabel>Host</StyledConnectionLabel>
      <StyledConnectionTextInput onChange={props.onHostChange} value={props.host} />
    </StyledConnectionFormEntry>
    <StyledConnectionFormEntry>
      <StyledConnectionLabel>Username</StyledConnectionLabel>
      <StyledConnectionTextInput onChange={props.onUsernameChange} value={props.username} />
    </StyledConnectionFormEntry>
    <StyledConnectionFormEntry>
      <StyledConnectionLabel>Password</StyledConnectionLabel>
      <StyledConnectionTextInput onChange={props.onPasswordChange} value={props.password} type='password' />
    </StyledConnectionFormEntry>
    <FormButton onClick={props.onConnectClick}>Connect</FormButton>
  </StyledConnectionForm>
)

export default ConnectForm
