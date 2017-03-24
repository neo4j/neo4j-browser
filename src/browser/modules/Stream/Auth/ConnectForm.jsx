import {FormButton} from 'browser-components/buttons'
import {H3} from 'browser-components/headers'
import {
  StyledConnectionForm,
  StyledConnectionFrame,
  StyledConnectionAside,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'

const ConnectForm = (props) => (
  <StyledConnectionFrame>
    <StyledConnectionAside>
      <H3>Connect to Neo4j</H3>
      Database access requires an authenticated connection.
    </StyledConnectionAside>
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
  </StyledConnectionFrame>
)

export default ConnectForm
